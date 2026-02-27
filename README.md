# BookDownloader

Trình cắm (Userscript) hỗ trợ tải truyện từ các website đọc truyện online phổ biến về định dạng Epub có kèm theo cả ảnh minh hoạ.

## Các Tính Năng Mới

- **Hỗ Trợ Đa Nền Tảng:** Thiết kế một script duy nhất hoạt động trên nhiều trang truyện.
- **Tuỳ Biến CSS Selector:** Cho phép thiết lập định dạng tìm kiếm (Cover, Author, Title, Chapter List...) cho từng tên miền trực tiếp trên giao diện bằng Code Editor chuyên dụng (hỗ trợ JavaScript Syntax Highlighting).
- **Bộ Nhớ Đệm (Cache):** Tích hợp IndexedDB tự động lưu giữ tiến độ down/cache các chương.
- **Tạm Dừng Thông Minh:** Tự động pause nếu bắt gặp kết nối lỗi liên tục (từ 5 lần trở lên) để chờ người dùng xem xét, hỗ trợ tải tiếp (resume) dễ dàng.

## Yêu Cầu Cài Đặt

1. Cài đặt tiện ích [Tampermonkey](https://www.tampermonkey.net/){:target="\_blank"} đối với trình duyệt trên máy tính (Chrome, Firefox, v.v...).
2. Cài đặt [Kiwi Browser](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser&hl=vi&gl=US){:target="\_blank"} hoặc [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox&hl=vi&gl=US){:target="\_blank"} đối với thiết bị sử dụng hệ điều hành Android. Sau đó cài đặt [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo){:target="\_blank"} trên trình duyệt đó.

[Xem video hướng dẫn cơ bản cách cài đặt và sử dụng Tampermonkey](https://www.youtube.com/watch?v=8tyjJD65zws&ab_channel=Tampermonkey){:target="\_blank"}

## Cài đặt Script

Sau khi cài đặt thành công `Tampermonkey`, chỉ cần nhấp vào liên kết bên dưới để cài đặt script sử dụng chung:

**[Cài Đặt BookDownloader (Bản mới)](https://longcuxit.github.io/book-downloader/build/static/install.user.js)**

(Thay thế cho các script riêng lẻ trước đây như `metruyencv.com`, `nettruyen.mobi`, `wattpad.vn`, v.v...)

## Hướng dẫn cài đặt chi tiết trên một số Website (Ví Dụ)

- [Nettruyen.mobi](https://nettruyen.mobi): Yêu cầu cần gỡ bỏ CORS bằng [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino){:target="\_blank"} trên Chrome để có thể tải ảnh từ chương về epub một cách chính xác.

## Liên Hệ

Nếu gặp khúc mắc, hãy liên hệ:

1. [Facebook messenger](http://m.me/longcuxit)
2. [Zalo messenger](http://zalo.me/0986518558)
