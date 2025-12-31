# VOCA Master (단어 학습 앱)

이 프로젝트는 React로 만들어진 단어 학습 웹 애플리케이션입니다.

## 🚀 시작하는 방법 (How to Start)

### 1. 터미널 열기
VS Code 상단 메뉴에서 `Terminal` > `New Terminal`을 클릭하거나, 단축키 `Ctrl` + `~` (물결표시)를 누르세요.

### 2. 패키지 설치 (처음 한 번만)
아래 명령어를 입력하고 엔터(Enter)를 누르세요.
```bash
npm install
```

### 3. 앱 실행하기
설치가 끝나면 아래 명령어를 입력하세요.
```bash
npm run dev
```
터미널에 나오는 주소(예: `http://localhost:5173`)를 `Ctrl` + 클릭하면 브라우저가 열립니다.

## 📚 데이터 추가하는 방법

단어장은 `src/data/books` 폴더 안에 JSON 파일로 관리됩니다.

### 새 책 추가하기
1. `src/data/books` 폴더에 새 파일(예: `level3.json`)을 만드세요.
2. 기존 파일(`level1.json`) 형식을 복사해서 내용을 채워넣으세요.
3. `src/data/index.js` 파일을 열어서 새 파일을 등록해주세요:
   ```javascript
   import level3 from './books/level3.json'; // 추가

   const vocabularyData = {
     textbooks: [
       level1,
       level2,
       level3 // 추가
     ]
   };
   ```

## 🛠 주요 기능
- **로그인**: 사용자 이름 저장
- **학습 모드**: 플래시카드 뒤집기
- **테스트 모드**: 스펠링 퀴즈
- **오답 노트**: 틀린 단어만 다시 학습
