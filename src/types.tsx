// src/types.ts

interface Flat { path: string; hash: string }
interface Node extends Flat { children: Node[]; isSummary: boolean }

function buildTree(flat: Flat[]): Node[] {
  const stack: Node[] = [];
  const roots: Node[] = [];

  for (const item of flat) {
    const isFolderMarker = /\\$/.test(item.path);

    // ── 새 규칙 ──────────────────────────────
    // 같은 폴더 경로가 *연속*으로 두 번 나오면
    // 두 번째 레코드는 '요약 줄(♦♦)' 로 취급
    const isRepeated = stack.length > 0 &&
                       stack[stack.length - 1].path === item.path;

    const isSummary = isFolderMarker && isRepeated;

    const node: Node = { ...item, children: [], isSummary };

    if (isSummary) {
      stack.pop();                     // 폴더 닫힘
      (stack.length ? stack[stack.length - 1].children : roots).push(node);
      continue;
    }

    if (isFolderMarker) {
      (stack.length ? stack[stack.length - 1].children : roots).push(node);
      stack.push(node);
    } else {
      (stack.length ? stack[stack.length - 1].children : roots).push(node);
    }
  }
  return roots;
}

/** 해시 알고리즘 종류 */
export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";

/** 개별 파일 및 폴더의 경로, 해시, 자식 목록을 담는 타입 */
export interface FileHash {
  path: string;
  hash: string;  // 파일 또는 폴더의 해시 값
  fileHashes: FileHash[]; // 하위 파일·폴더 목록
}

/** compute_hash 커맨드가 반환하는 리포트 구조 */
export interface HashReport {
  hash: string;         // 최종 또는 파일별 SHA-256 해시 (대문자 HEX)
  timeTaken: string;    // 실행 시간 (HH:MM:SS)
  folderCount: number;  // 서브폴더 개수
  fileCount: number;    // 파일 개수
  path: string;         // 해시 대상 경로
  fileHashes: FileHash[];
}

export interface Settings {
  algorithm: HashAlgorithm;
  testReportNo: string;
  productName: string;
  applicantCo: string;
  copyrightCo: string;
  testDate: string;
  labName: string;
  testerName: string;
  docFormId: string;
}

/** Hash Code List 용 HTML */
export function generateHashListHTML(report: HashReport, settings: Settings): string {
  const roots = buildTree(report.fileHashes);

  function render(nodes: Node[]): string {
    return nodes.map(n => {
    /* ── ①  폴더 제목(∴) ─ 빈·비어있음 상관없이 처리 ───── */
    const isFolderTitle = n.path.endsWith("\\") && !n.isSummary;
    if (isFolderTitle) {
      return `
<hr class="hr_folder_name">
&#8756; ${n.path}<br>
<hr class="hr_folder_name">          <!-- 항상 아래쪽 점선 한 줄 -->
${render(n.children)}                <!-- children 이 없으면 공백 -->
`;
    }
  
      /* ── 폴더 요약 줄(♦♦) ──────────────────── */
      if (n.isSummary) {
        return `
  &#9830;&#9830; ${n.path}<br>${n.hash ? n.hash + '<br>' : ''}<br>
  `; }
  
      /* ── 파일 줄(♦) ───────────────────────── */
      return `
  &#9830; ${n.path}<br>${n.hash}<br><br>
  `;
    }).join('');
  }
  

  return `<!DOCTYPE HTML>
<html>
<head>
  <meta charset="utf-8" />
  <title>${settings.testReportNo}</title>
<style type="text/css">
			@page
			{
				size:		a4;
			}

			body
			{
				font-family:	"돋움", "Dotum";
				font-size:	12pt;
				line-height:	1.5em;
			}
       h1,h2,h3,h4,h5,h6 {
       margin:0px;
       padding:5px;
       display:inline;
     }

			.table_hash_result
			{
				width:		95%;
				padding:	0;
				margin:		0 0 0 2.0em;
				border:0;
       border-color: #000;
				border-spacing:	0px;
				border-collapse:collapse;
				border:		1.5pt solid;
				text-indent:	0.5em;
			}

			.table_tester
			{
				width:		100%;
				padding:	0;
				border:		0;
				border-spacing:	0px;
				border-collapse:collapse;
			}

			.table_tester tr, td
			{
				padding:	0px;
			}

			.div_list
			{
				margin-left:	4em;
				text-indent:	-1.2em;
			}

			.div_list_descryption
			{
				margin-left:	4em;
				text-indent:	-1.2em;
				line-height:	1.2em;
				word-break:	keep-all;
			}

			.div_hash_result_descryption
			{
				text-indent:	0em;
				margin-left:	0.5em;
			}

			.div_hash_result_code
			{
				font-family:	"돋움체", "DotumChe";
				font-weight:	bold;
				letter-spacing: 0.05em;
				text-indent:	0em;
				margin-left:	1em;
				word-break:	break-all;
			}

			.div_hash_result_code2
			{
				font-family:	"돋움체", "DotumChe";
				font-weight:	bold;
				letter-spacing: 0.05em;
				text-indent:	0em;
				margin-left:	4em;
				word-break:	break-all;
			}

			.div_hash_code_list
			{
				font-family:	"돋움체", "DotumChe";

				letter-spacing: 0.05em;
				word-break:	break-all;
			}

			.div_tester
			{
				text-indent:	4.1em;
			}

			.div_tester2
			{
				text-indent:	5.5em;
			}

			.div_tester_signiture
			{
				text-align: right;
				margin-right:	2em;
			}

			.div_subject
			{
				font-size:	24pt;
				font-weight:	bold;

				text-align:	center;
				text-decoration:underline;
			}

			.div_bold
			{
				font-weight:	bold;
			}			

			.div_date
			{
				text-align:	center;
			}

			.div_hash_list_hash_code
			{
				margin-top:	-0.5em;
				margin-bottom:	-1em;
			}
  .div_hash_code_page { page-break-before: always; }

  .hr_folder_name
			{
 margin: 3px 0;
 padding: 0;
				height: 0px;
				color: #fff;
				background-color: #fff;
				border: 0px;
				border-top: 1px dotted #000;
			}
		</style>
</head>
<body>
  <div class="div_subject">Hash Code List</div><br>
  <div class="div_list">&#927; Product Name : <b>${settings.productName}</b></div>
  <div class="div_list">&#927; Applicant Co. : ${settings.applicantCo}</div>
  <div class="div_list">&#927; Final Hash Code :</div>
  <div class="div_hash_result_code2">${report.hash}</div>
  <div class="div_list">&#927; ${report.fileCount} Files / ${report.folderCount} Folders:</div><br>
  <div class="div_hash_code_list">
  ${render(roots)}
  </div>
  <hr class="hr_folder_name"><hr class="hr_folder_name"><div>END.</div><hr class="hr_folder_name"><hr class="hr_folder_name">
</body>
</html>`;
}

/** Confirmation of Hash Code 용 HTML */
export function generateHashReportHTML(
  report: HashReport,
  settings: Settings
): string {
  const formattedDate = new Date(settings.testDate)
    .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const alg = settings.algorithm.toUpperCase().replace("SHA", "SHA-");

  return `<!DOCTYPE HTML>
<html>
<head>
  <meta charset="utf-8" />
  <title>${settings.testReportNo}</title>
<style type="text/css">
			@page
			{
				size:		a4;
			}

			body
			{
				font-family:	"돋움", "Dotum";
				font-size:	12pt;
				line-height:	1.5em;
			}
       h1,h2,h3,h4,h5,h6 {
       margin:0px;
       padding:5px;
       display:inline;
     }

			.table_hash_result
			{
				width:		95%;
				padding:	0;
				margin:		0 0 0 2.0em;
				border:0;
       border-color: #000;
				border-spacing:	0px;
				border-collapse:collapse;
				border:		1.5pt solid;
				text-indent:	0.5em;
			}

			.table_tester
			{
				width:		100%;
				padding:	0;
				border:		0;
				border-spacing:	0px;
				border-collapse:collapse;
			}

			.table_tester tr, td
			{
				padding:	0px;
			}

			.div_list
			{
				margin-left:	4em;
				text-indent:	-1.2em;
			}

			.div_list_descryption
			{
				margin-left:	4em;
				text-indent:	-1.2em;
				line-height:	1.2em;
				word-break:	keep-all;
			}

			.div_hash_result_descryption
			{
				text-indent:	0em;
				margin-left:	0.5em;
			}

			.div_hash_result_code
			{
				font-family:	"돋움체", "DotumChe";
				font-weight:	bold;
				letter-spacing: 0.05em;
				text-indent:	0em;
				margin-left:	1em;
				word-break:	break-all;
			}

			.div_hash_result_code2
			{
				font-family:	"돋움체", "DotumChe";
				font-weight:	bold;
				letter-spacing: 0.05em;
				text-indent:	0em;
				margin-left:	4em;
				word-break:	break-all;
			}

			.div_hash_code_list
			{
				font-family:	"돋움체", "DotumChe";

				letter-spacing: 0.05em;
				word-break:	break-all;
			}

			.div_tester
			{
				text-indent:	4.1em;
			}

			.div_tester2
			{
				text-indent:	5.5em;
			}

			.div_tester_signiture
			{
				text-align: right;
				margin-right:	2em;
			}

			.div_subject
			{
				font-size:	24pt;
				font-weight:	bold;

				text-align:	center;
				text-decoration:underline;
			}

			.div_bold
			{
				font-weight:	bold;
			}			

			.div_date
			{
				text-align:	center;
			}

			.div_hash_list_hash_code
			{
				margin-top:	-0.5em;
				margin-bottom:	-1em;
			}
  .div_hash_code_page { page-break-before: always; }

  .hr_folder_name
			{
 margin: 3px 0;
 padding: 0;
				height: 0px;
				color: #fff;
				background-color: #fff;
				border: 0px;
				border-top: 1px dotted #000;
			}
		</style>
</head>
<body>
  <div class="div_subject">Confirmation of Hash Code</div><br><br>
  <div class="div_list">&#927; Test Report No. : <span class="div_bold">${settings.testReportNo}</span></div>
  <div class="div_list">&#927; Product Name : <span class="div_bold">${settings.productName}</span></div>
  <div class="div_list">&#927; Applicant Co. : ${settings.applicantCo}</div>
  <div class="div_list">&#927; CopyRight Co. : ${settings.copyrightCo}</div><br>
  <div class="div_list">&#927; Hash Result</div>
  <table class="table_hash_result">
    <tr><td><br>
      <div>&#9830; Final Hash Code : </div>
      <div class="div_hash_result_code">${report.hash}</div><br>
      <div>&#9830; Number of Files : ${report.fileCount} Files</div><br>
      <div>&#9830; Hash Tool : HashMaker v3.0</div><br>
      <div>&#9830; Hash Algorithm : ${alg}</div><br>
    </td></tr>
  </table><br>
  <div class="div_list_descryption">&#927; The above hash code can be used for integrity validation of tested products. (Attachment: Hash code list of files)</div><br>
  <div class="div_list_descryption">&#927; For your notice products and documents submitted for testing have been discarded.</div><br><br>
  <div class="div_date">${formattedDate}</div><br><br>
  <table class="table_tester">
    <tr><td><div>Tester :   ${settings.labName}</div></td><td></td></tr>
    <tr><td><div class="div_tester"> ${settings.testerName}</div></td><td><div class="div_tester_signiture">(Signature)</div></td></tr>
  </table>
</body>
</html>`;
}
