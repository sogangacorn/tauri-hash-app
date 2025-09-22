// src-tauri/src/lib.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{
    fs::{self, File},
    io::{BufReader, Read},
    path::{Path, PathBuf},
    time::Instant,
};
use tauri::{command, Window, Emitter};
use walkdir::WalkDir;
use md5::Md5;
use sha1::Sha1;
use sha2::Sha384;

#[derive(Serialize, serde::Deserialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub enum HashAlgorithm {
    Md5,
    Sha1,
    Sha256,
    Sha384,
    Sha512,
}

#[derive(Serialize, Clone)]
struct ProgressPayload {
    status: String,
    processed: usize,
    total: usize,
}

struct ProgressState<'a> {
    window: &'a Window,
    processed: usize,
    total: usize,
}

impl<'a> ProgressState<'a> {
    fn new(window: &'a Window, total: usize) -> Self {
        Self {
            window,
            processed: 0,
            total,
        }
    }

    fn emit(&self, status: &str) {
        let payload = ProgressPayload {
            status: status.to_string(),
            processed: self.processed,
            total: self.total,
        };
        println!(
            "[progress] status={} processed={} total={}",
            payload.status, payload.processed, payload.total
        );
        let _ = self.window.emit("hash-progress", payload);
    }

    fn set_status(&self, status: &str) {
        self.emit(status);
    }

    fn increment(&mut self, status: &str) {
        if self.processed < self.total {
            self.processed += 1;
        }
        self.emit(status);
    }

    fn complete(&mut self, status: &str) {
        self.processed = self.total;
        self.emit(status);
    }
}

enum AnyHasher {
    Md5(Md5),
    Sha1(Sha1),
    Sha256(Sha256),
    Sha384(Sha384),
    Sha512(sha2::Sha512),
}

impl AnyHasher {
    fn new(algorithm: HashAlgorithm) -> Self {
        match algorithm {
            HashAlgorithm::Md5 => AnyHasher::Md5(Md5::new()),
            HashAlgorithm::Sha1 => AnyHasher::Sha1(Sha1::new()),
            HashAlgorithm::Sha256 => AnyHasher::Sha256(Sha256::new()),
            HashAlgorithm::Sha384 => AnyHasher::Sha384(Sha384::new()),
            HashAlgorithm::Sha512 => AnyHasher::Sha512(sha2::Sha512::new()),
        }
    }

    fn update(&mut self, data: &[u8]) {
        match self {
            AnyHasher::Md5(h) => h.update(data),
            AnyHasher::Sha1(h) => h.update(data),
            AnyHasher::Sha256(h) => h.update(data),
            AnyHasher::Sha384(h) => h.update(data),
            AnyHasher::Sha512(h) => h.update(data),
        }
    }

    fn finalize(self) -> String {
        match self {
            AnyHasher::Md5(h) => format!("{:X}", h.finalize()),
            AnyHasher::Sha1(h) => format!("{:X}", h.finalize()),
            AnyHasher::Sha256(h) => format!("{:X}", h.finalize()),
            AnyHasher::Sha384(h) => format!("{:X}", h.finalize()),
            AnyHasher::Sha512(h) => format!("{:X}", h.finalize()),
        }
    }
}

/// 개별 파일·폴더 해시를 담을 구조체
#[derive(Serialize)]
pub struct FileHash {
    pub path: String,
    pub hash: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
/// 전체 해시 보고서
pub struct HashReport {
    pub hash: String,
    pub time_taken: String,
    pub folder_count: usize,
    pub file_count: usize,
    pub path: String,
    pub file_hashes: Vec<FileHash>,
}

/// 단일 파일 해시 계산 (HEX, 대문자)
fn hash_file(path: &Path, algorithm: HashAlgorithm) -> Result<String, String> {
    let file = File::open(path).map_err(|e| e.to_string())?;
    let mut reader = BufReader::new(file);
    let mut buffer = [0u8; 8192];

    let mut hasher = AnyHasher::new(algorithm);

    while let Ok(n) = reader.read(&mut buffer) {
        if n == 0 { break; }
        hasher.update(&buffer[..n]);
    }
    Ok(hasher.finalize())
}

/// 재귀적으로 디렉토리 순회 및 해시 수집:
/// 1) 서브폴더 재귀 호출
/// 2) 폴더 오픈 마커 출력
/// 3) 파일 해시 처리
/// 4) 폴더 요약 마커 출력
/// 반환값: 해당 디렉토리 내 파일 해시 목록
fn compute_and_collect(
    dir: &Path,
    base: &Path,
    out: &mut Vec<FileHash>,
    algorithm: HashAlgorithm,
    progress: &mut ProgressState,
) -> Result<Vec<String>, String> {
    // 1) 폴더 내용 읽고 정렬
    let mut entries: Vec<_> = fs::read_dir(dir)
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();
    entries.sort_by_key(|e| e.file_name());
    let (dirs, files): (Vec<_>, Vec<_>) = entries.into_iter()
        .partition(|e| e.path().is_dir());

    // 자식 폴더 먼저 처리
    let mut collected = Vec::new();
    for entry in &dirs {
        let child_hashes = compute_and_collect(&entry.path(), base, out, algorithm, progress)?;
        collected.extend(child_hashes);
    }

    // 상대 경로 마커 준비
    let rel = dir.strip_prefix(base).map_err(|e| e.to_string())?
        .to_string_lossy().replace('/', "\\");
    let marker = format!("\\{}\\", rel);

    // 2) 폴더 오픈 마커 (내용 있으면 출력)
    out.push(FileHash { path: marker.clone(), hash: String::new() });

    // 3) 파일 해시 처리
    for entry in &files {
        let path = entry.path();
        let h = hash_file(&path, algorithm)?;
        let rel_file = path.strip_prefix(base).map_err(|e| e.to_string())?
            .to_string_lossy().replace('/', "\\");
        out.push(FileHash { path: format!("\\{}", rel_file), hash: h.clone() });
        collected.push(h);
        progress.increment("Computing hash...");
        println!(
            "[compute_and_collect] processed file {:?} ({}/{})",
            path,
            progress.processed,
            progress.total
        );
    }

    // 4) 폴더 요약 마커 출력  ─────────────────────────────
    let summary = if collected.is_empty() {
      String::new()                     // ▶ 자식이 0개면 해시를 비워 둡니다
    } else {
      let mut hasher = AnyHasher::new(algorithm);
      for h in &collected { hasher.update(h.as_bytes()); }
      hasher.finalize()
    };
    out.push(FileHash { path: marker.clone(), hash: summary });
    Ok(collected)
}

#[command]
async fn compute_hash(window: Window, path: String, algorithm: HashAlgorithm) -> Result<HashReport, String> {
    let start = Instant::now();
    let root = PathBuf::from(&path);

    // 전체 폴더 및 파일 개수
    let (folder_count, total_files) = if root.is_dir() {
        let mut folders = 0;
        let mut files = 0;
        for entry in WalkDir::new(&root).into_iter().filter_map(Result::ok) {
            if entry.file_type().is_dir() {
                folders += 1;
            } else if entry.file_type().is_file() {
                files += 1;
            }
        }
        (folders, files)
    } else if root.is_file() {
        (0, 1)
    } else {
        (0, 0)
    };

    let mut progress = ProgressState::new(&window, total_files);
    progress.set_status("Listing files and folders...");
    println!(
        "[compute_hash] target={} folders={} files={}",
        path, folder_count, total_files
    );

    // 기준 경로
    let base = root.parent().ok_or("Base path error")?;
    let mut out = Vec::new();

    progress.set_status("Computing hash...");

    // 파일 또는 디렉토리 처리
    let all_hashes = if root.is_file() {
        let h = hash_file(&root, algorithm)?;
        let rel = root.strip_prefix(base).map_err(|e| e.to_string())?
            .to_string_lossy().replace('/', "\\");
        out.push(FileHash { path: format!("\\{}", rel), hash: h.clone() });
        println!("[compute_hash] single file processed");
        progress.increment("Computing hash...");
        vec![h]
    } else {
        compute_and_collect(&root, base, &mut out, algorithm, &mut progress)?
    };

    progress.complete("Making report...");
    progress.set_status("Ready");

    // 최종 루트 해시 계산 및 마커
    let mut hasher = AnyHasher::new(algorithm);
    for h in &all_hashes { hasher.update(h.as_bytes()); }
    let root_hash = hasher.finalize();
    println!("[compute_hash] hashing completed, total files processed={}", progress.processed);
    let _rel_root = root.strip_prefix(base).map_err(|e| e.to_string())?
        .to_string_lossy().replace('/', "\\");

    // 결과 조립
    let elapsed = start.elapsed();
    let time_taken = format!("{:02}:{:02}:{:02}",
        elapsed.as_secs()/3600,
        (elapsed.as_secs()%3600)/60,
        elapsed.as_secs()%60);
    let file_count = all_hashes.len();

    Ok(HashReport {
        hash: root_hash,
        time_taken,
        folder_count,
        file_count,
        path,
        file_hashes: out,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![compute_hash])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
