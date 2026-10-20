import type { ThemeConfig } from 'antd';
import { font, palette, radius } from './tokens';

/**
 * AntD 是全站唯一主 UI 系统。这里把它的 token 映射到设计令牌，
 * 让普通控件（表单/弹窗/表格）与学习端的大画面共用同一套视觉语言。
 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: palette.blueStrong,
    colorSuccess: palette.green,
    colorWarning: palette.sunDeep,
    colorTextBase: palette.ink,
    colorBgBase: palette.white,
    colorBorder: palette.line,
    borderRadius: 16,
    borderRadiusLG: radius.md,
    fontFamily: font.body,
    fontSize: 16,
    controlHeight: 44,
    controlHeightLG: 52,
  },
  components: {
    Button: {
      // 主按钮在监护端保持常规高度；学习端另有大按钮组件
      controlHeightLG: 52,
      fontWeight: 700,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
    Layout: {
      bodyBg: palette.sky1,
      headerBg: palette.white,
      siderBg: palette.white,
    },
    Menu: {
      itemSelectedBg: palette.blueSoft,
      itemSelectedColor: palette.blueStrong,
      itemBorderRadius: 14,
      itemHeight: 44,
    },
    Card: {
      borderRadiusLG: radius.md,
    },
    Table: {
      headerBg: palette.sky1,
      headerColor: palette.ink2,
      borderColor: palette.line,
    },
    Segmented: {
      itemSelectedBg: palette.white,
      itemSelectedColor: palette.blueStrong,
    },
  },
};
