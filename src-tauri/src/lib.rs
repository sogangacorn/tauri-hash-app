// src-tauri/src/lib.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use sha2::{Sha256, Digest};
use std::{
    fs::{self, File},
    io::{BufReader, Read},
    path::{Path, PathBuf},
    time::Instant,
};
use tauri::command;
use walkdir::WalkDir;

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

/// 단일 파일 SHA-256 해시 계산 (HEX, 대문자)
fn hash_file(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|e| e.to_string())?;
    let mut reader = BufReader::new(file);
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];
    while let Ok(n) = reader.read(&mut buffer) {
        if n == 0 { break; }
        hasher.update(&buffer[..n]);
    }
    Ok(format!("{:X}", hasher.finalize()))
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
        let child_hashes = compute_and_collect(&entry.path(), base, out)?;
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
        let h = hash_file(&path)?;
        let rel_file = path.strip_prefix(base).map_err(|e| e.to_string())?
            .to_string_lossy().replace('/', "\\");
        out.push(FileHash { path: format!("\\{}", rel_file), hash: h.clone() });
        collected.push(h);
    }

    // 4) 폴더 요약 마커 출력  ─────────────────────────────
    let summary = if collected.is_empty() {
      String::new()                     // ▶ 자식이 0개면 해시를 비워 둡니다
    } else {
      let mut hasher = Sha256::new();
      for h in &collected { hasher.update(h.as_bytes()); }
      format!("{:X}", hasher.finalize())
    };
    out.push(FileHash { path: marker.clone(), hash: summary });
    Ok(collected)
}

#[command]
async fn compute_hash(path: String) -> Result<HashReport, String> {
    let start = Instant::now();
    let root = PathBuf::from(&path);

    // 전체 폴더 개수
    let folder_count = if root.is_dir() {
        WalkDir::new(&root)
            .into_iter()
            .filter_map(Result::ok)
            .filter(|e| e.file_type().is_dir())
            .count()
    } else { 0 };

    // 기준 경로
    let base = root.parent().ok_or("Base path error")?;
    let mut out = Vec::new();

    // 파일 또는 디렉토리 처리
    let all_hashes = if root.is_file() {
        let h = hash_file(&root)?;
        let rel = root.strip_prefix(base).map_err(|e| e.to_string())?
            .to_string_lossy().replace('/', "\\");
        out.push(FileHash { path: format!("\\{}", rel), hash: h.clone() });
        vec![h]
    } else {
        compute_and_collect(&root, base, &mut out)?
    };

    // 최종 루트 해시 계산 및 마커
    let mut hasher = Sha256::new();
    for h in &all_hashes { hasher.update(h.as_bytes()); }
    let root_hash = format!("{:X}", hasher.finalize());
    let rel_root = root.strip_prefix(base).map_err(|e| e.to_string())?
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
