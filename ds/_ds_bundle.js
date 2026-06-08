/* @ds-bundle: {"format":3,"namespace":"OnCourtDesignSystem_dbd40f","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"}],"sourceHashes":{"components/core/Button.jsx":"921d74a0cabf"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OnCourtDesignSystem_dbd40f = window.OnCourtDesignSystem_dbd40f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * OnCourt Button — the primary interactive primitive.
 * Flame-filled primary, outline secondary, quiet ghost. Calm, precise motion.
 */
function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  onClick,
  children,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "0 16px",
      height: 36,
      font: "var(--fs-body-sm)",
      gap: 8
    },
    md: {
      padding: "0 22px",
      height: 46,
      font: "var(--fs-body)",
      gap: 10
    },
    lg: {
      padding: "0 30px",
      height: 56,
      font: "var(--fs-body-lg)",
      gap: 12
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--text-on-flame)",
      border: "1px solid transparent",
      boxShadow: "var(--shadow-sm)"
    },
    secondary: {
      background: "transparent",
      color: "var(--text-primary)",
      border: "1px solid var(--border-strong)",
      boxShadow: "none"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-primary)",
      border: "1px solid transparent",
      boxShadow: "none"
    },
    inverse: {
      background: "var(--bone-50)",
      color: "var(--graphite-700)",
      border: "1px solid transparent",
      boxShadow: "var(--shadow-sm)"
    }
  };
  const v = variants[variant] || variants.primary;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hoverStyle = !disabled && hover ? variant === "primary" ? {
    background: "var(--accent-hover)"
  } : variant === "secondary" ? {
    borderColor: "var(--text-primary)",
    background: "var(--bone-100)"
  } : variant === "ghost" ? {
    background: "var(--bone-300)"
  } : {
    background: "#fff",
    transform: "translateY(-1px)"
  } : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? "flex" : "inline-flex",
      width: fullWidth ? "100%" : "auto",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--weight-medium)",
      fontSize: s.font,
      letterSpacing: "-0.01em",
      lineHeight: 1,
      borderRadius: "var(--radius-pill)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)",
      transform: !disabled && press ? "scale(0.98)" : "scale(1)",
      whiteSpace: "nowrap",
      ...v,
      ...hoverStyle,
      ...style
    }
  }, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      marginLeft: -2
    }
  }, iconLeft) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      marginRight: -2
    }
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

})();
