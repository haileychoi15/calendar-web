# Calendar Prototype

## 프로젝트 개요

일정 생성(Create Event) 경험을 검증하기 위한 인터랙션 프로토타입을 제작한다.

완전한 캘린더 서비스를 만드는 것이 목적이 아니라,
사용자가 빠르고 자연스럽게 일정을 생성하는 경험을 구현하는 것이 목표이다.

캘린더 뷰, 일정 생성 UX의 인퍼페이스와 인터랙션 완성도를 우선한다.

---

# 프로젝트 범위

## 포함

- Week Calendar 화면
- Calendar Header
- Create Event Button
- Event Creation Modal
- Event 생성
- 생성된 Event를 Calendar에 표시

## 제외

다음 기능은 현재 구현하지 않는다.

- Login
- User 관리
- Google Calendar 연동
- 반복 일정
- Notification
- Timezone 처리
- 공유 기능
- Settings
- Backend
- Database
- API 연동

필요 시 이후 단계에서 추가한다.

---

# 개발 원칙

- 사용자 플로우를 우선한다.
- 불필요한 기능은 구현하지 않는다.
- 단순하고 이해하기 쉬운 구조를 유지한다.
- 컴포넌트는 재사용 가능하게 작성한다.
- 디자인은 docs/design.md를 기준으로 구현한다.
- 새로운 기능을 추가하기 전에 프로젝트 범위에 포함되는지 먼저 검토한다.
