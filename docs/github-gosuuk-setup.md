# gosuuk GitHub Setup

이 프로젝트만 `gosuuk/busan` 저장소로 올리는 설정입니다. Mac의 기본 GitHub 계정과 전역 git 설정은 바꾸지 않습니다.

대상 저장소:

```text
https://gosuuk@github.com/gosuuk/busan.git
```

## 1. 바로 Push하기

프로젝트 루트에서 실행합니다.

```bash
cd /Users/bt/Desktop/busan
pnpm github:gosuuk
```

위 명령은 내부적으로 다음을 처리합니다.

- git 저장소 초기화
- `main` 브랜치 설정
- 이 프로젝트에만 `user.name=gosuuk` 설정
- 이 프로젝트에만 `user.email=gosuuk@users.noreply.github.com` 설정
- `origin`을 `https://gosuuk@github.com/gosuuk/busan.git`로 연결
- 현재 프로젝트 파일 commit
- `origin/main`으로 push

처음 push할 때 GitHub 인증을 물어보면 username은 `gosuuk`, password는 GitHub 비밀번호가 아니라 `gosuuk` 계정의 Personal Access Token을 입력합니다.

필요 권한은 classic token 기준 `repo`입니다. fine-grained token을 쓴다면 `gosuuk/busan` 저장소에 `Contents: Read and write` 권한을 줍니다.

## 2. 다른 GitHub 계정과 섞일 때

remote에 username을 포함해 두었는지 확인합니다.

```bash
git remote -v
```

정상 예시:

```text
origin  https://gosuuk@github.com/gosuuk/busan.git (fetch)
origin  https://gosuuk@github.com/gosuuk/busan.git (push)
```

다른 계정 자격 증명이 계속 잡히면 이 저장소 경로의 GitHub keychain 항목을 지운 뒤 다시 push합니다.

```bash
printf "protocol=https\nhost=github.com\npath=gosuuk/busan.git\nusername=gosuuk\n\n" | git credential-osxkeychain erase
git push -u origin main
```

`gh auth status`가 다른 계정으로 나와도 괜찮습니다. 이 프로젝트는 `gh` 대신 `git push`로 올립니다.

## 3. SSH로 완전히 분리하고 싶을 때

HTTPS 대신 계정별 SSH 키를 쓰면 더 확실하게 분리할 수 있습니다. `gosuuk` 계정에 별도 SSH key를 등록한 뒤 `~/.ssh/config`에 아래처럼 추가합니다.

```sshconfig
Host github.com-gosuuk
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_gosuuk
  IdentitiesOnly yes
```

연결 확인은 아래 명령으로 합니다.

```bash
ssh -T git@github.com-gosuuk
```

성공하면 `gosuuk` 계정으로 인증되었다는 메시지가 나옵니다. GitHub SSH 테스트 명령은 성공해도 exit code가 1일 수 있으니 메시지를 기준으로 확인합니다.

그 다음 이 프로젝트에서만 remote를 SSH alias로 바꿉니다.

```bash
REMOTE_URL=git@github.com-gosuuk:gosuuk/busan.git pnpm github:gosuuk
```

## 4. commit 작성자 이메일을 바꾸고 싶을 때

스크립트 기본값은 `gosuuk@users.noreply.github.com`입니다. GitHub 계정의 숫자 포함 noreply 주소를 사용하려면 아래처럼 실행합니다.

```bash
GIT_USER_EMAIL="12345678+gosuuk@users.noreply.github.com" pnpm github:gosuuk
```

정확한 noreply 주소는 GitHub `Settings > Emails`에서 확인할 수 있습니다.
