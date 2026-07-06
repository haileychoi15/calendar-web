# Design System

calendar-web의 디자인 시스템 문서입니다.  
**모든 UI 컴포넌트는 이 문서와 `app/globals.css`에 정의된 토큰을 기준으로 구현합니다.**

---

### 디자인 방향

- **Notion Calendar**처럼 차분하고 정돈된 느낌을 유지한다.
- 정보 밀도는 적절히 유지하되, 시각적 소음은 최소화한다.
- Primary 컬러는 강조가 필요한 순간에만 사용하고, 나머지는 Toss Grey 중립색으로 통일한다.
- 그림자·모션·장식은 절제한다. 기능이 먼저, 스타일은 뒤다.

### 기술 스택

| 영역 | 선택 |
|------|------|
| Framework | Next.js 16 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Nova preset, Base UI) |
| Color System | Toss Design System (`@toss/tds-colors`) |
| Typography | Pretendard + Toss Design System |
| Icons | Lucide |
| 토큰 정의 | `app/globals.css` (shadcn → Toss CSS Variables 매핑) |
| 컴포넌트 설정 | `components.json` (`baseColor: neutral`) |

---

## 토큰 사용 원칙

1. **디자인 토큰 우선** — 색상·Radius·Duration 등을 하드코딩하지 않는다.
2. **Semantic Color 우선** — `bg-primary`, `text-foreground` 등 shadcn semantic 토큰을 사용한다. Hex·임의 색상 값은 사용하지 않는다.
3. **Tailwind Utility 우선** — 인라인 스타일·임의 값(`rounded-[10px]` 등)을 피한다.
4. **shadcn/ui 우선** — 새 UI가 필요하면 `npx shadcn add`로 추가한 뒤 토큰에 맞게 조정한다.
5. **기존 컴포넌트 재사용** — 동일한 패턴을 새로 만들지 않는다.
6. **문서와 코드 동기화** — 토큰을 변경할 때는 `globals.css`와 이 문서를 함께 업데이트한다.
7. **새 색상 정의 금지** — `@toss/tds-colors`에 없는 색상을 직접 추가하지 않는다.

---

## Typography

Typography는 **Toss Design System 원칙**을 따르되, 한국어 가독성을 위해 **Pretendard**를 기본 폰트로 사용한다.

### 기본 폰트

- **Sans (기본)**: Pretendard Variable
- **Mono**: Geist Mono (코드·숫자 정렬 등 제한적 사용)

Pretendard는 `next/font/local`로 로드하며, 앱 전체 기본 폰트로 적용된다.

| 설정 | 값 |
|------|-----|
| 폰트 파일 | `app/fonts/PretendardVariable.woff2` |
| CSS Variable | `--font-pretendard` |
| Tailwind | `font-sans` |
| Heading | `font-heading` (= Pretendard) |

### 적용 방법

```tsx
// layout.tsx — 폰트 변수 등록
<html className={`${pretendard.variable} ...`}>
  <body className="font-sans">...</body>
</html>
```

```css
/* globals.css */
--font-sans: var(--font-pretendard);
--font-heading: var(--font-pretendard);
```

### 타이포그래피 가이드

| 용도 | 권장 클래스 | 비고 |
|------|-------------|------|
| 본문 | `text-sm`, `text-base` | 기본 `font-sans` 상속 |
| 보조 텍스트 | `text-muted-foreground` | 날짜 라벨, 힌트 |
| 제목 | `font-medium` ~ `font-semibold` | 과도한 `font-bold` 지양 |
| 코드/고정폭 | `font-mono` | 최소한으로 사용 |

---

## Colors

### Color System

| 계층 | 역할 |
|------|------|
| **Source** | `@toss/tds-colors` — Toss Design System 색상 팔레트 |
| **Bridge** | `app/globals.css` — Toss CSS Variable → shadcn semantic token 매핑 |
| **Usage** | shadcn/ui 컴포넌트 + Tailwind semantic utility (`bg-primary`, `border-border` 등) |

컴포넌트 라이브러리는 **shadcn/ui**를 유지하고, 색상만 Toss 토큰을 사용한다.

### 적용 구조

```
@toss/tds-colors (colors.css, colors.light.css)
        ↓
app/globals.css (:root / .dark semantic 매핑)
        ↓
shadcn/ui 컴포넌트 (bg-primary, text-foreground, …)
```

### 팔레트 구조

| 역할 | Toss Token | 용도 |
|------|-----------|------|
| **Primary** | `blue500` | Primary Button, Selected Date, Active State, Focus Ring |
| **Neutral** | `grey50` ~ `grey900` | 배경, 텍스트, Border, Hover, Muted |
| **Destructive** | `red500` | 에러, 삭제 |
| **Identity** | `teal500`, `orange500`, `purple500` 등 | 캘린더별 구분 색상 |

> Primary는 위 네 가지 상황에만 사용한다.  
> Hover 배경, 카드, 일반 텍스트, Divider에는 Grey 중립색을 사용한다.

### Semantic Tokens (shadcn → Toss)

#### Light Mode (`:root`)

| shadcn Token | Toss Token | Tailwind Utility |
|--------------|-----------|------------------|
| `--background` | `--lightThemeBackground` | `bg-background` |
| `--foreground` | `--grey900` | `text-foreground` |
| `--card` | `--layeredBackground` | `bg-card` |
| `--muted` | `--grey100` | `bg-muted` |
| `--muted-foreground` | `--grey500` | `text-muted-foreground` |
| `--secondary` | `--grey100` | `bg-secondary` |
| `--accent` | `--grey100` | `bg-accent` |
| `--border` | `--lightThemeHairlineBorder` | `border-border` |
| `--input` | `--grey200` | `border-input` |
| `--primary` | `--blue500` | `bg-primary`, `text-primary` |
| `--primary-foreground` | `--white` | `text-primary-foreground` |
| `--ring` | `--blue500` | `ring-ring`, `outline-ring` |
| `--destructive` | `--red500` | `bg-destructive`, `text-destructive` |

#### Dark Mode (`.dark`)

| shadcn Token | Toss Token |
|--------------|-----------|
| `--background` | `--darkThemeBackground` |
| `--foreground` | `--darkThemeGrey900` |
| `--card` | `--darkThemeBackgroundLevel01` |
| `--muted` | `--darkThemeGrey100` |
| `--muted-foreground` | `--darkThemeGrey500` |
| `--border` | `--darkThemeHairlineBorder` |
| `--primary` | `--darkThemeBlue500` |
| `--ring` | `--darkThemeBlue500` |
| `--destructive` | `--darkThemeRed500` |

Adaptive 토큰(`--adaptiveGrey900` 등)은 `colors.light.css`와 `app/toss-adaptive-dark.css`에서 라이트/다크별로 제공된다.

### Calendar Identity Colors

캘린더별 구분 색상은 Toss 팔레트 토큰을 `@theme`에 노출해 사용한다.

| Tailwind Utility | Toss Token |
|------------------|-----------|
| `bg-toss-blue-500` | `--blue500` |
| `bg-toss-teal-500` | `--teal500` |
| `bg-toss-orange-500` | `--orange500` |
| `bg-toss-red-500` | `--red500` |
| `bg-toss-purple-500` | `--purple500` |

### Primary 사용 범위

| 상황 | 권장 Utility | 예시 |
|------|-------------|------|
| Primary Button | `bg-primary text-primary-foreground` | "일정 만들기" CTA |
| Selected Date | `bg-primary text-primary-foreground` | 캘린더 선택된 날짜 |
| Active State | `bg-primary` 또는 `data-active:` variant | 활성 탭, 선택된 항목 |
| Focus State | `ring-ring`, `focus-visible:ring-ring/50` | 키보드 포커스 |

### 사용하지 않는 패턴

```tsx
// ❌ Hex 하드코딩
<div className="bg-[#3182F6] text-slate-900 border-[#e2e8f0]" />

// ❌ Tailwind 기본 팔레트 직접 사용
<div className="bg-blue-500 text-gray-900" />

// ✅ Semantic 토큰 사용
<div className="bg-primary text-primary-foreground border-border" />

// ✅ 캘린더 identity (Toss 토큰 경유)
<div className="bg-toss-teal-500" />
```

---

## Radius

컴포넌트 유형별 Radius는 고정값을 사용한다.  
shadcn/Tailwind radius scale에 매핑되어 있다.

| 컴포넌트 | Token | 값 | Tailwind Class |
|----------|-------|-----|----------------|
| Button | `--radius-button` | 10px | `rounded-lg` |
| Input | `--radius-input` | 10px | `rounded-lg` |
| Card | `--radius-card` | 12px | `rounded-xl` |
| Dialog | `--radius-dialog` | 16px | `rounded-2xl` |

### Radius Scale (참고)

| Token | 값 | 용도 |
|-------|-----|------|
| `--radius-sm` | 6px | 작은 요소 |
| `--radius-md` | 8px | 보조 요소 |
| `--radius-lg` | 10px | Button, Input |
| `--radius-xl` | 12px | Card |
| `--radius-2xl` | 16px | Dialog, Modal |

```tsx
// ✅
<button className="rounded-lg" />
<div className="rounded-xl border border-border" />
<dialog className="rounded-2xl" />

// ❌
<button className="rounded-[10px]" />
```

---

## Spacing

### 기준

**8pt Grid** — 모든 간격은 4px 단위(8의 배수 중심)로 맞춘다.

Tailwind 기본 spacing scale을 그대로 사용한다. 별도 오버라이드 없음.

| Token | px | Tailwind | 용도 예시 |
|-------|-----|----------|-----------|
| 1 | 4 | `p-1`, `gap-1` | 아이콘 내부 여백 |
| 2 | 8 | `p-2`, `gap-2` | 컴팩트 요소 |
| 3 | 12 | `p-3`, `gap-3` | 버튼 내부 |
| 4 | 16 | `p-4`, `gap-4` | 기본 패딩 |
| 5 | 20 | `p-5`, `gap-5` | — |
| 6 | 24 | `p-6`, `gap-6` | 섹션 간격 |
| 8 | 32 | `p-8`, `gap-8` | 카드 패딩 |
| 10 | 40 | `p-10`, `gap-10` | — |
| 12 | 48 | `p-12`, `gap-12` | 페이지 여백 |
| 16 | 64 | `p-16`, `gap-16` | 대형 섹션 |

### Spacing 가이드

- 인접한 관련 요소: `gap-2` ~ `gap-4`
- 컴포넌트 내부 패딩: `p-3` ~ `p-4`
- 섹션 / 카드 패딩: `p-6` ~ `p-8`
- 8pt grid에 없는 값(`p-[13px]` 등)은 사용하지 않는다.

---

## Shadow

### 원칙

- 그림자는 **최소한**으로 사용한다.
- 큰 elevation(`shadow-lg` 이상)은 사용하지 않는다.
- `shadow-lg`, `shadow-xl`, `shadow-2xl`은 `shadow-md`와 동일하게 cap되어 있다.

### Shadow Scale

| Token | 용도 |
|-------|------|
| `shadow-xs` | 거의 보이지 않는 구분 |
| `shadow-sm` | 카드, 드롭다운 (기본) |
| `shadow` | 기본 elevation |
| `shadow-md` | **최대 허용** — Dialog, Popover |

```tsx
// ✅
<div className="rounded-xl border border-border shadow-sm" />

// ❌
<div className="shadow-2xl" />
<div className="shadow-[0_20px_50px_rgba(0,0,0,0.3)]" />
```

---

## Border

### 원칙

| 속성 | 값 |
|------|-----|
| 두께 | **1px** (Tailwind `border` 기본값) |
| 색상 | Toss Grey 중립색 (`border-border`, `border-input`) |
| 스타일 | `solid` (기본) |

### 사용 가이드

| 상황 | Utility |
|------|---------|
| 일반 구분선 | `border border-border` |
| Input, Select | `border border-input` |
| 포커스 | `focus-visible:border-ring` (Primary) |
| 에러 | `border-destructive` |

배경과 Border의 대비는 subtle하게 유지한다. Border로 구조를 표현하고, Shadow로 대체하지 않는다.

---

## Motion

### 원칙

- Transition은 **과하지 않게** 설정한다.
- 기본 easing: **ease-out** (`cubic-bezier(0, 0, 0.2, 1)`)
- `prefers-reduced-motion` 환경을 고려한다 (tw-animate-css 기본 지원).

### Duration Tokens

| Token | 값 | Tailwind | 용도 |
|-------|-----|----------|------|
| `--transition-duration-default` | 150ms | `duration-default` | 색상·opacity 등 일반 전환 |
| `--transition-duration-hover` | 200ms | `duration-hover` | Hover 상태 |
| `--transition-duration-modal` | 250ms | `duration-modal` | Dialog, Sheet, Popover |

### 사용 예시

```tsx
// 일반 인터랙션
<button className="transition-colors duration-default ease-out hover:bg-muted" />

// Hover 강조
<div className="transition-all duration-hover ease-out" />

// Modal / Overlay
<div className="transition-opacity duration-modal ease-out" />
```

### Motion 가이드

- 한 요소에 여러 duration을 혼용하지 않는다.
- `transition-all`은 필요한 경우에만 사용하고, 가능하면 `transition-colors` 등으로 범위를 제한한다.
- Bounce, Spring 등 과장된 easing은 사용하지 않는다.

---

## Component Rules

새 컴포넌트를 만들거나 shadcn 컴포넌트를 커스터마이즈할 때 아래 규칙을 따른다.

### 1. shadcn/ui 우선

```bash
npx shadcn add button input card dialog
```

- Nova preset(`base-nova`) 스타일을 기본으로 한다.
- 컴포넌트 추가 후 이 문서의 토큰에 맞는지 확인한다.

### 2. 파일 구조

```
components/
  ui/          # shadcn/ui 컴포넌트 (수정 최소화)
  calendar/    # 도메인 컴포넌트 (ui/ 조합)
```

- 범용 UI → `components/ui/`
- 캘린더 도메인 UI → `components/calendar/` (또는 기능별 폴더)

### 3. 스타일링 규칙

| 항목 | 규칙 |
|------|------|
| 색상 | `bg-*`, `text-*`, `border-*` semantic 토큰만 사용 |
| Radius | 컴포넌트 유형별 Tailwind class 사용 (위 Radius 표 참고) |
| Spacing | 8pt grid Tailwind scale |
| Shadow | `shadow-sm` ~ `shadow-md` |
| Motion | `duration-default` / `duration-hover` / `duration-modal` + `ease-out` |
| 조합 | `cn()` (`@/lib/utils`)으로 className 병합 |

### 4. Variant 설계

- shadcn의 `cva` 패턴을 따른다.
- Primary variant만 `bg-primary`를 사용한다.
- Outline, Ghost, Secondary는 Neutral 색상을 사용한다.

### 5. 접근성

- 포커스 링: `focus-visible:ring-ring/50` (Primary)
- 키보드 조작 가능한 모든 인터랙티브 요소에 visible focus 제공
- 색상만으로 상태를 전달하지 않는다 (아이콘·텍스트 병행)

### 6. 다크 모드

- `.dark` 클래스 기반 (shadcn 기본)
- 컴포넌트별 다크 모드 색상을 하드코딩하지 않고 semantic 토큰에 의존한다.

---

## 구현 체크리스트

새 컴포넌트 PR 전 아래 항목을 확인한다.

- [ ] `font-sans`(Pretendard) 상속 또는 명시
- [ ] Primary 색상이 허용된 용도에만 사용되었는가
- [ ] 배경·텍스트·Border에 Toss Grey semantic 토큰을 사용했는가
- [ ] Hex 색상·Tailwind 기본 팔레트(`bg-blue-500` 등)를 직접 사용하지 않았는가
- [ ] Radius가 컴포넌트 유형에 맞는 Tailwind class인가
- [ ] Spacing이 8pt grid 값인가
- [ ] Shadow가 `shadow-md` 이하인가
- [ ] Border가 1px `border-border` / `border-input`인가
- [ ] Transition duration·easing이 토큰을 따르는가
- [ ] 하드코딩된 색상·px 값이 없는가
- [ ] 기존 `components/ui/` 컴포넌트를 재사용했는가

---

## 참고 파일

| 파일 | 역할 |
|------|------|
| `app/globals.css` | shadcn semantic → Toss 토큰 매핑 |
| `app/toss-adaptive-dark.css` | 다크 모드 Adaptive 토큰 (`.dark`) |
| `app/layout.tsx` | Pretendard 폰트 로드 |
| `components.json` | shadcn/ui 설정 (`baseColor: neutral`) |
| `components/ui/` | shadcn 기본 컴포넌트 |
| `@toss/tds-colors` | Toss 색상 팔레트 소스 |

토큰 값을 변경할 때는 **`@toss/tds-colors` 패키지**를 기준으로 `globals.css` 매핑과 이 문서를 함께 업데이트한다.
