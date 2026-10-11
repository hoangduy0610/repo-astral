# RepoAstral — Product Requirements Document (PRD)

**Version:** 1.0 — MVP  
**Product type:** Interactive Web Application  
**Tagline:** Your code. Your universe.  
**Target audience:** Software Developers, GitHub Users  
**Development target:** 1 day (6–8 hours)  
**Release target:** Public MVP

---

## 1. Product Overview

### 1.1. Giới thiệu

RepoAstral là web app cho phép người dùng khám phá GitHub profile dưới dạng một vũ trụ tương tác.

Mỗi GitHub user sở hữu một vũ trụ riêng, được xây dựng tự động từ dữ liệu public repositories của họ.

Các thành phần:

- **Central Star:** Đại diện cho GitHub user.
- **Planets:** Đại diện cho các repositories.
- **Planet Size:** Phản ánh số lượng GitHub stars.
- **Planet Color:** Phản ánh ngôn ngữ lập trình chính.
- **Planet Orbit:** Các quỹ đạo sắp xếp hành tinh trong không gian.
- **Planet Glow:** Phản ánh mức độ nổi bật của repository.
- **Space Background:** Nền không gian với các ngôi sao, bụi vũ trụ và hiệu ứng chuyển động.

Người dùng có thể tương tác với từng hành tinh, khám phá thông tin repository, lưu hình ảnh vũ trụ và chia sẻ kết quả.

### 1.2. Product Goals

1. Cho phép người dùng tạo vũ trụ từ GitHub username mà không cần đăng nhập.
2. Tạo trải nghiệm trực quan, mượt và có tính thẩm mỹ cao.
3. Cung cấp thông tin hữu ích về repositories dưới hình thức mới.
4. Cho phép tạo ảnh cá nhân hóa để chia sẻ trên mạng xã hội.
5. Có thể deploy nhanh, chi phí vận hành thấp.

### 1.3. Non-Goals — MVP

- Không cần GitHub OAuth.
- Không truy cập private repositories.
- Không cần database.
- Không có tài khoản người dùng.
- Không có hệ thống social/follow.
- Không có AI-generated content.
- Không phân tích commits hay contribution graph.
- Không yêu cầu mô hình vật lý thiên văn chính xác.

---

## 2. User Flow

### Flow A — Tạo vũ trụ

1. Người dùng mở trang chủ.
2. Nhập GitHub username.
3. Nhấn **Explore My Universe**.
4. Hệ thống lấy dữ liệu GitHub profile và public repositories.
5. Hiển thị loading animation với hiệu ứng hình thành vũ trụ.
6. Chuyển tới trang vũ trụ của người dùng.
7. Từng hành tinh xuất hiện theo animation.

### Flow B — Khám phá repository

1. Người dùng di chuyển chuột hoặc chạm vào một hành tinh.
2. Hệ thống highlight hành tinh.
3. Hiển thị thông tin repository.
4. Người dùng nhấn vào **View on GitHub** để mở repository tương ứng.

### Flow C — Chia sẻ

1. Người dùng mở vũ trụ của mình.
2. Nhấn **Export Universe**.
3. Hệ thống tạo ảnh PNG độ phân giải cao.
4. Người dùng tải xuống và đăng lên mạng xã hội.

Ngoài ra, người dùng có thể nhấn **Share Universe** để sao chép URL trang cá nhân.

---

## 3. Functional Requirements

### FR-01 — GitHub Username Input [P0]

Trang chủ có input cho phép nhập GitHub username.

Yêu cầu:

- Cho phép nhập username hoặc GitHub profile URL.
- Tự động trim khoảng trắng và chuẩn hóa đầu vào.
- Validate định dạng GitHub username.
- Enter để submit.
- Hiển thị loading trong quá trình tải.
- Xử lý trường hợp username không tồn tại.
- Không yêu cầu người dùng cấp quyền GitHub.

**Acceptance Criteria:**

- Nhập username hợp lệ sẽ chuyển tới `/u/{username}`.
- Nhập URL GitHub hợp lệ sẽ tự động trích xuất username.
- Username không tồn tại sẽ hiển thị thông báo thân thiện.
- Không cho phép nhiều request trùng nhau khi đang tải.

### FR-02 — GitHub Data Integration [P0]

Sử dụng GitHub REST API để lấy dữ liệu public.

Thông tin profile:

- Username
- Display name
- Avatar URL
- Bio
- Profile URL
- Public repositories count
- Followers count

Thông tin repository:

- ID
- Name
- Description
- URL
- Primary language
- Stars count
- Forks count
- Repository size
- Created date
- Last pushed date
- Fork status
- Archived status

Quy tắc lấy dữ liệu:

- Chỉ lấy public repositories.
- Mặc định bỏ qua repositories dạng fork.
- Phân trang tối đa 3 trang, mỗi trang 100 repositories, sắp xếp theo `pushed` giảm dần.
- Hiển thị tối đa 40 repositories dưới dạng hành tinh.
- Ưu tiên lựa chọn repositories theo stars giảm dần, sau đó theo last pushed date.
- Nếu người dùng có hơn 300 repositories, kết quả được xác định từ tối đa 300 repositories được truy xuất, không khẳng định là toàn bộ.
- Không gọi endpoint language detail cho từng repository trong MVP.

**Acceptance Criteria:**

- Dữ liệu hiển thị phải tương ứng với GitHub API.
- Không tạo dữ liệu giả khi API lỗi.
- Không đánh đồng số public repositories với số hành tinh đang hiển thị.
- Repository không xác định được language vẫn có thể hiển thị.

### FR-03 — Universe Visualization [P0]

Đây là chức năng cốt lõi của sản phẩm.

Vũ trụ gồm:

**A. Central Star**

Đại diện cho chủ sở hữu GitHub profile.

- Nằm ở trung tâm vũ trụ.
- Có hiệu ứng glow.
- Hiển thị username.
- Có thể xem thông tin profile.
- Phát ra hiệu ứng pulse nhẹ.

**B. Planets**

Mỗi hành tinh đại diện cho một repository.

- Hành tinh có kích thước khác nhau.
- Màu sắc tương ứng với programming language.
- Có hiệu ứng ánh sáng và đổ bóng.
- Di chuyển chậm theo quỹ đạo.
- Vị trí của hành tinh được tính toán ổn định theo repository ID.

**C. Orbits**

- Các vòng quỹ đạo bao quanh central star.
- Số vòng phụ thuộc vào số repository được hiển thị.
- Nét quỹ đạo mảnh, độ trong suốt thấp.
- Không có yêu cầu mô phỏng trọng lực thực tế.

**D. Background**

- Gradient không gian tối.
- Các ngôi sao nhỏ ngẫu nhiên nhưng có seed cố định.
- Hiệu ứng twinkling nhẹ.
- Có thể bổ sung nebula bằng radial gradients.
- Không dùng video background.

**Acceptance Criteria:**

- Mỗi repository được chọn tương ứng với đúng một hành tinh.
- Cùng một dataset tạo ra layout nhất quán giữa các lần truy cập.
- Không có hành tinh tự ý thay đổi kích thước khi animation chạy.
- Có thể tương tác với hành tinh trên cả desktop và mobile.

### FR-04 — Planet Interaction [P0]

Khi hover hoặc click vào hành tinh:

- Hành tinh được highlight.
- Hiển thị tooltip/detail card.
- Có thể giữ hành tinh được chọn bằng click.
- Hiển thị tên, mô tả, language, stars, forks và last pushed date.
- Có nút View on GitHub.

Nếu mô tả quá dài, giới hạn 3 dòng và cho phép xem nội dung đầy đủ qua tooltip hoặc detail panel.

**Acceptance Criteria:**

- Click vào hành tinh không làm chuyển trang ngoài ý muốn.
- Link GitHub phải dẫn tới repository chính xác.
- Có thể đóng detail card bằng nút Close hoặc Escape.

### FR-05 — Universe Navigation [P0]

Hỗ trợ các thao tác:

- Zoom in/out bằng mouse wheel.
- Drag để pan trên desktop.
- Pinch-to-zoom và drag trên thiết bị cảm ứng.
- Nút Reset View.
- Click hành tinh để focus vào hành tinh.

Giới hạn zoom đề xuất: 0.5x–2.5x.

Khi vào trang, tự động tính viewport để hiển thị được toàn bộ vũ trụ cơ bản.

### FR-06 — Universe Statistics [P0]

Hiển thị các thống kê:

- Public Repositories
- Visualized Repositories
- Stars của các repositories được lấy
- Top Programming Languages
- Most Starred Repository

Các số liệu phải được ghi rõ phạm vi.

Ví dụ: nếu chỉ truy xuất 300 repositories thì không được ghi tổng stars đó là tổng stars trên toàn bộ GitHub profile.

### FR-07 — Export Universe [P0]

Cho phép người dùng xuất ảnh vũ trụ.

Yêu cầu:

- Format: PNG.
- Resolution: 1920 × 1080.
- Background giữ nguyên phong cách không gian.
- Hiển thị username, tên sản phẩm và một số thống kê cơ bản.
- Không chứa tooltip, button hoặc các thành phần điều khiển.
- Có thể xuất ảnh trên desktop và mobile.

Tên file: `repoastral-{username}.png`.

Ảnh xuất phải được render độc lập ở độ phân giải mục tiêu, không phụ thuộc vào kích thước cửa sổ trình duyệt.

### FR-08 — Share Universe [P0]

URL của mỗi vũ trụ:

`/u/{github_username}`

Yêu cầu:

- Có thể mở trực tiếp URL.
- Refresh trang không mất vũ trụ.
- Có nút Copy Link.
- Hỗ trợ native share trên trình duyệt phù hợp.
- Nếu không hỗ trợ native share, fallback sang clipboard.

### FR-09 — Theme Customization [P1]

Để sau MVP.

Có thể hỗ trợ:

- Deep Space
- Aurora
- Cyberpunk
- Minimal Cosmos

Theme thay đổi màu background, starfield, glow và một số hiệu ứng ánh sáng; không thay đổi dữ liệu GitHub.

---

## 4. Quy tắc chuyển dữ liệu GitHub thành vũ trụ

### 4.1. Planet Mapping

| GitHub data | Visual representation |
|---|---|
| Repository ID | Định danh hành tinh |
| Repository name | Tên hành tinh |
| Primary language | Màu sắc hành tinh |
| Stars count | Bán kính và mức glow |
| Repository description | Nội dung detail |
| Repository URL | External link |
| Last pushed date | Thông tin hoạt động gần nhất |
| Fork count | Thống kê trong detail |

Lưu ý: Khoảng cách từ hành tinh đến ngôi sao trung tâm chỉ phục vụ bố cục. Không được trình bày như một thước đo chất lượng hoặc hoạt động của repository.

### 4.2. Planet Size

Dùng logarithmic scaling để hạn chế việc repositories có quá nhiều stars chiếm toàn bộ màn hình.

Công thức đề xuất:

`radius = 6 + min(16, 4 × log2(stars + 1))`

Ví dụ:

| Stars | Radius |
|---|---|
| 0 | 6 px |
| 1 | 10 px |
| 10 | ~19.8 px |
| 100 | 22 px |
| 1,000 | 22 px |

Giá trị dùng cho tọa độ thiết kế, được scale khi zoom.

### 4.3. Planet Color

Bảng màu tham khảo:

| Language | Hex |
|---|---|
| TypeScript | #3178C6 |
| JavaScript | #F1E05A |
| Python | #3572A5 |
| Go | #00ADD8 |
| Rust | #DEA584 |
| Java | #B07219 |
| C++ | #F34B7D |
| PHP | #4F5D95 |
| C# | #178600 |
| Other / Unknown | #8B8B97 |

Các ngôn ngữ ngoài bảng được gán màu ổn định từ hash của language name.

### 4.4. Planet Glow

Glow được chia thành các cấp độ trang trí:

- 0 stars: basic glow.
- 1–9 stars: soft glow.
- 10–99 stars: medium glow.
- 100–999 stars: bright glow.
- 1,000+ stars: strong glow.

Các ngưỡng có thể điều chỉnh theo kết quả thực tế.

### 4.5. Orbital Layout

Đề xuất dùng thuật toán layout đơn giản, không sử dụng physics engine.

1. Sắp xếp repositories theo stars giảm dần.
2. Phân phối hành tinh vào các vòng quỹ đạo.
3. Hành tinh lớn được ưu tiên đặt ở các vòng trong.
4. Sử dụng seeded hash của repository ID để tạo góc ban đầu.
5. Điều chỉnh khoảng cách góc để hạn chế chồng lấn.
6. Tốc độ xoay thấp và khác nhau giữa các vòng.
7. Nếu hành tinh chồng lấn khi animation, ưu tiên khả năng click và highlight, không bắt buộc collision physics.

Khi pause animation, vị trí hành tinh phải ổn định.

---

## 5. UI/UX Specification

### 5.1. Visual Direction

**Style:** Cinematic Space / Sci-Fi Minimalism

Đặc điểm:

- Dark theme mặc định.
- Không gian sâu, ánh sáng dịu.
- Gradient xanh đậm, tím và cyan.
- Glassmorphism giới hạn ở panel và controls.
- Không dùng quá nhiều hiệu ứng neon.
- Animation chậm, mượt và có chủ đích.
- Ưu tiên canvas lớn, UI controls gọn gàng.

### 5.2. Design Tokens

| Token | Value |
|---|---|
| Background | #070B1A |
| Surface | #11182D |
| Primary | #7C8CFF |
| Accent | #66E5FF |
| Primary Text | #F5F7FF |
| Secondary Text | #94A3B8 |
| Border | #26314C |
| Border Radius | 12–16 px |

Typography:

- Heading: Space Grotesk.
- Body: Inter.
- Statistics: JetBrains Mono.

### 5.3. Screen 01 — Landing Page

**Header**

- RepoAstral logo.
- About.
- View Demo.
- GitHub link của dự án.

**Hero**

Heading:

"Your GitHub. A Universe of Its Own."

Subtitle:

"Turn your repositories into planets and explore the universe you've built with code."

Main interaction:

- GitHub username input.
- Explore My Universe button.

Background:

- Animated starfield.
- Hero universe illustration hoặc live demo.
- Không dùng animation quá nặng.

**Footer**

- Made for developers.
- GitHub API attribution.
- Project source link.

### 5.4. Screen 02 — Universe Explorer

**Top Bar**

- RepoAstral logo.
- GitHub username/avatar.
- New Universe action.
- Export button.
- Share button.

**Main Area**

- Universe canvas.
- Central star.
- Planets.
- Orbit rings.
- Background stars.

**Left Panel — Profile Information**

- Avatar.
- Display name.
- Username.
- Bio.
- Public repositories.
- Stars in dataset.
- Top languages.

**Right Panel — Planet Detail**

Chỉ hiện khi chọn hành tinh:

- Repository name.
- Language.
- Description.
- Stars.
- Forks.
- Last pushed date.
- View on GitHub.

**Bottom Right — Universe Controls**

- Zoom In.
- Zoom Out.
- Reset View.
- Pause / Resume animation.

### 5.5. Responsive Behavior

Desktop:

- Left profile panel, center canvas, right contextual detail.
- Hỗ trợ pan/zoom bằng chuột.

Mobile:

- Canvas fullscreen.
- Profile thu gọn thành header/card.
- Planet detail hiển thị bằng bottom sheet.
- Controls dạng floating buttons.
- Điều hướng bằng touch gestures.
- Hạn chế độ phức tạp của background animation.

---

## 6. Technical Specification

### 6.1. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Rendering | Canvas 2D |
| Animation | requestAnimationFrame |
| API | GitHub REST API |
| Server | Next.js Route Handlers |
| Deployment | Vercel |
| Database | None |

**Rendering Decision:** Chọn Canvas 2D thay cho Three.js trong MVP để tối ưu thời gian phát triển, tương tác 2D và export PNG.

Kiến trúc cần tách dữ liệu vũ trụ khỏi renderer để có thể bổ sung Three.js trong phiên bản sau.

### 6.2. Route Structure

- `/` — Landing page.
- `/u/[username]` — Universe explorer.
- `/api/github/[username]` — Backend proxy lấy GitHub data.

### 6.3. GitHub API Endpoints

- `GET https://api.github.com/users/{username}`
- `GET https://api.github.com/users/{username}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=1`

Tiếp tục các trang sau khi cần, tối đa 3 trang.

Backend proxy thực hiện:

1. Validate username.
2. Fetch GitHub profile.
3. Fetch public repositories.
4. Chuẩn hóa dữ liệu.
5. Lọc forks.
6. Lựa chọn tối đa 40 hành tinh.
7. Tính các thống kê.
8. Trả về JSON chuẩn hóa.

Không trả về GitHub token trong response.

### 6.4. Core Data Models

**GitHubProfile**

- username: string
- name: string | null
- avatarUrl: string
- bio: string | null
- profileUrl: string
- publicRepos: number
- followers: number

**Repository**

- id: number
- name: string
- description: string | null
- url: string
- language: string | null
- stars: number
- forks: number
- size: number
- pushedAt: string | null
- fork: boolean
- archived: boolean

**Planet**

- repositoryId: number
- radius: number
- color: string
- orbitRadius: number
- initialAngle: number
- angularSpeed: number
- glowIntensity: number

**Universe**

- profile: GitHubProfile
- repositories: Repository[]
- planets: Planet[]
- stats: UniverseStats
- generatedAt: string
- repositoryLimitApplied: boolean

### 6.5. Error Handling

| Scenario | Expected behavior |
|---|---|
| Username không tồn tại | User Not Found screen |
| Không có public repository | Empty Universe với central star |
| GitHub API timeout | Error + Retry |
| GitHub rate limit | Thông báo tạm thời không tải được |
| Repository thiếu language | Sử dụng màu fallback |
| Avatar không tải được | Placeholder |
| Không hỗ trợ clipboard | Hiển thị URL để copy thủ công |
| Export thất bại | Thông báo lỗi và cho phép thử lại |

### 6.6. Caching

- Cache GitHub response khoảng 10–15 phút.
- Dữ liệu cùng username được tái sử dụng trong thời gian cache.
- Không lưu dữ liệu dài hạn.
- Giới hạn số request đồng thời theo username nếu có thể.
- Hỗ trợ server-side GitHub token thông qua environment variable.
- Token phải có quyền tối thiểu và không được expose sang client.

### 6.7. Performance

Mục tiêu kỹ thuật:

- Tối đa 40 hành tinh trong MVP.
- Animation hướng tới 60 FPS trên desktop phổ thông.
- Giảm hiệu ứng trên thiết bị yếu.
- Dừng animation khi tab không hiển thị.
- Hỗ trợ `prefers-reduced-motion`.
- Canvas scale theo device pixel ratio có giới hạn.
- Tránh component React re-render theo từng animation frame.
- Có loading/error state rõ ràng khi request chậm.

---

## 7. Export Specification

Ảnh được xuất từ một offscreen canvas độc lập.

**Resolution:** 1920 × 1080  
**Format:** PNG  
**Background:** Deep Space  
**Content:**

- Central Star.
- Các hành tinh.
- Quỹ đạo và starfield.
- GitHub username.
- RepoAstral branding.
- Số repositories trực quan hóa.
- Tổng stars trong dataset.

**Composition:**

- Header góc trên trái: username.
- Center: vũ trụ.
- Footer: RepoAstral — Your code. Your universe.
- Statistics: bố trí tối giản, không che hành tinh.

Không dùng ảnh avatar trong export nếu ảnh đó không hỗ trợ tải cross-origin an toàn. Export không được thất bại chỉ vì avatar.

---

## 8. MVP Prioritization

### P0 — Must Have

- Landing page.
- Username input và validation.
- GitHub data integration.
- Universe generation.
- Canvas 2D animation.
- Repository interaction.
- Universe navigation.
- Statistics.
- PNG export.
- Shareable URL.
- Basic responsive UI.
- Loading, empty và error states.

### P1 — Should Have

- Multiple themes.
- Search repository.
- Language filtering.
- Dynamic personalized OG preview.
- Additional export presets.
- Better orbital layout.
- Keyboard accessibility enhancements.

### P2 — Future Features

- Three.js 3D universe.
- Compare two GitHub universes.
- GitHub OAuth.
- Contributions as stars or cosmic dust.
- Animated recording export.
- Galaxy timeline.
- Repository clusters.
- User-customized galaxies.

---

## 9. Development Plan

| Phase | Task | Estimate |
|---|---|---|
| 1 | Project setup, design tokens, landing page | 1h |
| 2 | GitHub API proxy, data models, normalization | 1h |
| 3 | Canvas renderer, planets, orbits, animation | 2h |
| 4 | Interactions, detail panel, responsive controls | 1h |
| 5 | PNG export và share URL | 1h |
| 6 | QA, optimization và Vercel deployment | 1–2h |

**Tổng:** 7–8 giờ. Đây là mục tiêu triển khai, không phải cam kết; phần Canvas và export có rủi ro vượt ước lượng cao nhất.

Nếu thiếu thời gian, ưu tiên một bản render tĩnh đẹp, hover/click hành tinh và export PNG hoạt động tốt hơn một hệ thống animation phức tạp nhưng chưa hoàn thiện.

---

## 10. Final Acceptance Criteria

MVP được xem là hoàn thành khi:

- [ ] Nhập GitHub username và tạo được một universe.
- [ ] Mỗi repository được chọn có một hành tinh tương ứng.
- [ ] Kích thước và màu sắc hành tinh được xác định từ dữ liệu GitHub.
- [ ] Có animation cơ bản và không gây giật nghiêm trọng.
- [ ] Có thể click vào hành tinh để xem repository.
- [ ] Có thể zoom, pan và reset.
- [ ] Có thể export PNG 1920 × 1080.
- [ ] Có thể sao chép URL để chia sẻ.
- [ ] Trang hoạt động trên desktop và mobile.
- [ ] Xử lý được profile không tồn tại, không có repository và lỗi API.
- [ ] Không để lộ GitHub token.
- [ ] Build thành công và deploy public.

---

## 11. Success Metrics

Các chỉ số theo dõi sau khi ra mắt:

- Số universe được tạo.
- Tỷ lệ người dùng tạo universe thành công.
- Số lần export PNG.
- Số lần copy/share URL.
- Số lượt click từ vũ trụ sang GitHub repository.
- Thời gian người dùng tương tác với universe.

MVP không bắt buộc xây dựng hệ thống analytics riêng. Có thể tích hợp analytics nhẹ sau khi sản phẩm đã hoạt động ổn định.

## 12. Product Positioning

RepoAstral không nhằm thay thế GitHub hoặc cung cấp báo cáo đánh giá năng lực lập trình viên.

Đây là một **creative developer visualization tool** — biến những dự án lập trình thành trải nghiệm thị giác cá nhân hóa, thú vị và dễ chia sẻ.

**Core message:**

"Every repository is a world you've built. Explore your universe."