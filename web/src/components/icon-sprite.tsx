/**
 * 全站图标符号表 —— 一个 SVG sprite，所有图标走这里。
 * 不引入第二套图标系统；AntD 的 @ant-design/icons 只用于监护端的界面符号。
 */
export function IconSprite() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path
            d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path
            d="M5 12.5l4.2 4.2L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-lock" viewBox="0 0 24 24">
          <rect x="4.5" y="10" width="15" height="10.5" rx="3" fill="currentColor" />
          <path
            d="M8 10V7.8a4 4 0 0 1 8 0V10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-chat" viewBox="0 0 24 24">
          <path
            d="M4.5 5.5h15a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H10l-5.5 3.8v-3.8h-.1a2 2 0 0 1-1.9-2V7.5a2 2 0 0 1 2-2z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-drop" viewBox="0 0 24 24">
          <path
            d="M12 2.4c3.9 5 6.3 8.2 6.3 11.3a6.3 6.3 0 1 1-12.6 0c0-3.1 2.4-6.3 6.3-11.3z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-paw" viewBox="0 0 24 24">
          <ellipse cx="12" cy="15.4" rx="5.2" ry="4.4" fill="currentColor" />
          <circle cx="5.9" cy="10.5" r="2.2" fill="currentColor" />
          <circle cx="9.8" cy="7.6" r="2.2" fill="currentColor" />
          <circle cx="14.2" cy="7.6" r="2.2" fill="currentColor" />
          <circle cx="18.1" cy="10.5" r="2.2" fill="currentColor" />
        </symbol>
        <symbol id="i-dice" viewBox="0 0 24 24">
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="15" r="1.5" fill="currentColor" />
        </symbol>
        <symbol id="i-house" viewBox="0 0 24 24">
          <path
            d="M3 11.2l9-7.1 9 7.1v8.1a1.7 1.7 0 0 1-1.7 1.7H4.7A1.7 1.7 0 0 1 3 19.3z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-play" viewBox="0 0 24 24">
          <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
        </symbol>
        <symbol id="i-sound" viewBox="0 0 24 24">
          <path d="M3.5 9.2h3.8l5-4.1v13.8l-5-4.1H3.5z" fill="currentColor" />
          <path
            d="M15.6 8.4a5 5 0 0 1 0 7.2M18.2 5.8a8.8 8.8 0 0 1 0 12.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-mute" viewBox="0 0 24 24">
          <path d="M3.5 9.2h3.8l5-4.1v13.8l-5-4.1H3.5z" fill="currentColor" />
          <path
            d="M16 9l5 5m0-5l-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-pause" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4.2" height="16" rx="2" fill="currentColor" />
          <rect x="13.8" y="4" width="4.2" height="16" rx="2" fill="currentColor" />
        </symbol>
        <symbol id="i-close" viewBox="0 0 24 24">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-ear" viewBox="0 0 24 24">
          <path
            d="M6.5 10.2a5.5 5.5 0 1 1 9.9 3.2c-1.4 2-3.1 3-3.1 5.1a2.1 2.1 0 0 1-4.2 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-mic" viewBox="0 0 24 24">
          <rect x="8.6" y="3" width="6.8" height="11" rx="3.4" fill="currentColor" />
          <path
            d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0M12 17.8V21"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-puzzle" viewBox="0 0 24 24">
          <path
            d="M10 3.5a2.2 2.2 0 0 1 4.4 0v1.2h3.4a1.6 1.6 0 0 1 1.6 1.6v3.4h1.2a2.2 2.2 0 0 1 0 4.4h-1.2v3.4a1.6 1.6 0 0 1-1.6 1.6h-3.6v-1.2a2.2 2.2 0 0 0-4.4 0v1.2H6.2a1.6 1.6 0 0 1-1.6-1.6v-3.6h1.2a2.2 2.2 0 0 0 0-4.4H4.6V6.3a1.6 1.6 0 0 1 1.6-1.6H10z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-chest" viewBox="0 0 24 24">
          <rect x="3" y="8.5" width="18" height="11.5" rx="3" fill="currentColor" />
          <path d="M3 11.5h18" stroke="#fff" strokeWidth="2" />
          <rect x="10.4" y="10.4" width="3.2" height="5" rx="1.2" fill="#fff" />
        </symbol>

        {/* 学习端底部导航 */}
        <symbol id="i-map" viewBox="0 0 24 24">
          <path
            d="M9 3.5L3 6v14.5L9 17.5l6 3 6-2.5V3.5l-6 2.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M9 3.5v14M15 6.5v14" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="i-card" viewBox="0 0 24 24">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M7 9.5h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-review" viewBox="0 0 24 24">
          <path
            d="M20 12a8 8 0 1 1-2.4-5.7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 4v4.5h-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-trophy" viewBox="0 0 24 24">
          <path
            d="M8 4h8v5a4 4 0 0 1-8 0z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M8 5.5H5.5v2A3.5 3.5 0 0 0 9 11M16 5.5h2.5v2A3.5 3.5 0 0 1 15 11M12 13v4M9 20h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </symbol>
      </defs>
    </svg>
  );
}
