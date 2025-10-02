import { resolveDirective as y, createElementBlock as n, openBlock as m, Fragment as c, renderSlot as w, createCommentVNode as r, withDirectives as x, createElementVNode as d, createVNode as g, normalizeClass as u, renderList as f, normalizeStyle as z, Transition as v, withCtx as p, withModifiers as b, vShow as W, nextTick as _ } from "vue";
const k = (s, o) => {
  const e = s.__vccOpts || s;
  for (const [i, t] of o)
    e[i] = t;
  return e;
}, A = {
  name: "VueImageZoomer",
  emits: ["onZoom", "offZoom", "regularLoaded", "zoomLoaded", "zoomLoading"],
  directives: {
    clickOutside: {
      mounted(s, o) {
        s.clickOutsideEvent = function(e) {
          s == e.target || s.contains(e.target) || o.value(e, s);
        }, document.body.addEventListener("click", s.clickOutsideEvent);
      },
      unmounted(s) {
        document.body.removeEventListener("click", s.clickOutsideEvent);
      }
    }
  },
  data() {
    return {
      touch: !1,
      zoomed: !1,
      x: 0,
      y: 0,
      touchPosition: 0,
      origX: 0,
      origY: 0,
      offsetLeft: 0,
      offsetTop: 0,
      zoomWidth: 0,
      zoomHeight: 0,
      options: {
        zoomAmount: 0,
        zoom: !1,
        zoomWebp: !1
      },
      loaded: !1,
      loading: !1,
      webp_supported: !1,
      cx: 0,
      cy: 0,
      showSlot: !0
    };
  },
  props: {
    regular: String,
    regularWebp: String,
    zoom: String,
    zoomWebp: String,
    imgClass: {
      type: String,
      default: ""
    },
    alt: String,
    zoomAmount: {
      type: Number,
      default: 0
    },
    clickZoom: Boolean,
    hoverMessage: {
      type: String,
      default: '<span class="vh--icon">&#9906;</span> Hover to zoom'
    },
    touchMessage: {
      type: String,
      default: '<span class="vh--icon">&#9906;</span> Tap to zoom'
    },
    clickMessage: {
      type: String,
      default: '<span class="vh--icon">&#9906;</span> Click to zoom'
    },
    closePos: {
      type: String,
      default: "top-left"
    },
    messagePos: {
      type: String,
      default: "bottom"
    },
    showMessage: {
      type: Boolean,
      default: !0
    },
    showMessageTouch: {
      type: Boolean,
      default: !0
    },
    tapToClose: Boolean,
    breakpoints: Array,
    touchZoomPos: {
      type: Array,
      default() {
        return [0.5, 0.5];
      }
    },
    imgWidth: Number,
    imgHeight: Number,
    lazyload: Boolean,
    rightClick: {
      type: Boolean,
      default: !0
    }
  },
  watch: {
    propChanges() {
      this.get_options();
    }
  },
  computed: {
    propChanges() {
      return `${this.breakpoints}|${this.regular}|${this.regularWebp}|${this.zoom}|${this.zoomAmount}|${this.zoomWebp}|${this.lazyload}`;
    }
  },
  mounted() {
    this.check_webp_feature("lossy", (s, o) => {
      o && (this.webp_supported = !0);
    }), this.get_options(), ("ontouchstart" in window || navigator.msMaxTouchPoints) && (this.touch = !0), this.touchLogic();
  },
  created() {
    window.addEventListener("resize", this.debounce(() => {
      this.resize();
    }, 500));
  },
  unmounted() {
    window.removeEventListener("resize", this.resize());
  },
  methods: {
    async touchLogic() {
      await _();
      let s, o, e = !1;
      this.$refs["vue-hover-zs"].addEventListener("touchstart", (i) => {
        if (this.zoomed) {
          i.cancelable && i.preventDefault();
          let t = i.changedTouches[0];
          s = t.pageX - this.cx, o = t.pageY - this.cy;
        }
      }), this.$refs["vue-hover-zs"].addEventListener("touchmove", (i) => {
        if (this.zoomed) {
          let t = i.changedTouches[0];
          this.x = t.pageX - s, this.y = t.pageY - o;
          const l = Math.max(0, this.zoomWidth - this.origX), a = Math.max(0, this.zoomHeight - this.origY);
          this.x <= -l && (this.x = -l), this.x >= 0 && (this.x = 0), this.y <= -a && (this.y = -a), this.y >= 0 && (this.y = 0), this.touchPosition = "translate3d(" + this.x + "px," + this.y + "px,0)", e = !0;
        }
      }), this.$refs["vue-hover-zs"].addEventListener("touchend", (i) => {
        if (this.zoomed) {
          let t = i.changedTouches[0];
          this.cx = t.pageX - s, this.cy = t.pageY - o, !e && this.tapToClose && (this.zoomed = !1, this.$emit("offZoom")), e = !1;
        }
      });
    },
    debounce(s, o) {
      let e;
      return (...i) => {
        const t = this;
        clearTimeout(e), e = setTimeout(() => s.apply(t, i), o);
      };
    },
    get_options() {
      this.options.zoomAmount = this.zoomAmount, this.options.zoom = this.zoom, this.options.zoomWebp = this.zoomWebp, this.zoom || (this.options.zoom = this.regular, this.options.zoomAmount = 2), !this.zoomWebp && this.regularWebp && (this.options.zoomWebp = this.regularWebp, this.options.zoomAmount = 2), this.resize();
    },
    resize() {
      this.zoomed = !1, this.loaded = !1;
    },
    check_webp_feature(s, o) {
      let e = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA"
      }, i = new Image();
      i.onload = () => {
        let t = i.width > 0 && i.height > 0;
        o(s, t);
      }, i.onerror = () => {
        o(s, !1);
      }, i.src = "data:image/webp;base64," + e[s];
    },
    loadImage(s, o) {
      const e = new Image();
      e.onload = o, e.src = s;
    },
    loadZoom() {
      this.offset(), this.options.zoomAmount != 0 && this.touch && this.mobilePos(), this.loaded ? (this.zoomed = !0, this.options.zoomAmount == 0 && (this.options.zoomAmount = this.zoomWidth / this.origX)) : this.zoomLoad();
    },
    zoomLoad() {
      (!this.clickZoom || this.touch) && (this.loading = !0, this.$emit("zoomLoading"));
      let s = this.options.zoom;
      this.breakpoints && this.breakpoints.forEach((o) => {
        window.innerWidth >= o.width && (o.zoom ? s = o.zoom : s = o.regular);
      }), this.webp_supported && this.options.zoomWebp && (s = this.options.zoomWebp, this.breakpoints && this.breakpoints.forEach((o) => {
        window.innerWidth >= o.width && (o.zoomWebp ? s = o.zoomWebp : s = o.regularWebp);
      })), this.loadImage(s, (o) => {
        if (this.options.zoomAmount == 0)
          this.zoomWidth = o.target.width, this.zoomHeight = o.target.height, this.options.zoomAmount = o.target.width / this.origX;
        else {
          const e = this.options.zoomAmount;
          this.zoomWidth = this.origX * e;
          const i = o.target.height / o.target.width;
          this.zoomHeight = this.zoomWidth * i;
        }
        console.log("Zoom Debug:", {
          original: { width: this.origX, height: this.origY },
          zoom: { width: this.zoomWidth, height: this.zoomHeight },
          zoomAmount: this.options.zoomAmount,
          maxMovement: { x: this.zoomWidth - this.origX, y: this.zoomHeight - this.origY }
        }), this.loaded = !0, this.loading = !1, this.$emit("zoomLoaded"), (!this.clickZoom || this.touch) && (this.zoomed = !0, this.mobilePos());
      });
    },
    isZoom(s, o) {
      (o == "hover" && !this.clickZoom && !this.touch || o == "click" && (this.clickZoom || this.touch) || typeof s == "object") && (this.zoomed = !1, s == !0 ? (this.loadZoom(), this.$emit("onZoom")) : this.$emit("offZoom"));
    },
    mobilePos() {
      const s = Math.max(0, this.zoomWidth - this.origX), o = Math.max(0, this.zoomHeight - this.origY);
      let e = s * this.touchZoomPos[0], i = o * this.touchZoomPos[1];
      (this.touchZoomPos[0] > 1 || this.touchZoomPos[0] < 0 || this.touchZoomPos[1] > 1 || this.touchZoomPos[1] < 0) && (e = 0, i = 0), this.cx = -e, this.cy = -i, this.x = -e, this.y = -i, this.touchPosition = "translate3d(-" + e + "px,-" + i + "px,0)";
    },
    offset() {
      this.origX = parseFloat(this.$refs["vue-hover-zs"].offsetWidth), this.origY = parseFloat(this.$refs["vue-hover-zs"].offsetHeight);
    },
    mousePos(s) {
      if (this.offsetLeft = window.pageXOffset + this.$refs["vue-hover-zs"].getBoundingClientRect().left, this.offsetTop = window.pageYOffset + this.$refs["vue-hover-zs"].getBoundingClientRect().top, !this.touch && !this.loading)
        if (!this.loaded)
          this.offset(), this.zoomLoad();
        else {
          const o = s.pageX - this.offsetLeft, e = s.pageY - this.offsetTop, i = this.zoomWidth / this.origX, t = this.zoomHeight / this.origY, l = Math.max(0, this.zoomWidth - this.origX), a = Math.max(0, this.zoomHeight - this.origY);
          this.x = Math.max(0, Math.min(o * (i - 1), l)), this.y = Math.max(0, Math.min(e * (t - 1), a)), console.log("Mouse Debug:", {
            mouse: { x: o, y: e },
            factors: { x: i, y: t },
            max: { x: l, y: a },
            position: { x: this.x, y: this.y }
          });
        }
    }
  }
}, M = { class: "vh--outer vh--rel" }, L = ["srcset", "media"], Z = ["srcset", "media"], T = ["srcset"], P = ["loading", "src", "alt", "width", "height"], H = { key: 0 }, X = ["srcset", "media"], Y = ["srcset", "media"], S = ["srcset", "media"], C = ["srcset", "media"], E = ["src"], B = ["src"], I = ["src"], V = ["innerHTML"], j = ["innerHTML"], D = ["innerHTML"], O = {
  key: 1,
  class: "vh--loading-o vh--abs vh--flex vh--jc vh--ai"
};
function F(s, o, e, i, t, l) {
  const a = y("click-outside");
  return m(), n(c, null, [
    t.showSlot && !e.lazyload ? w(s.$slots, "default", { key: 0 }) : r("", !0),
    x((m(), n("div", M, [
      d("div", {
        class: u(["vh--holder vh--rel vh--flex vh--jc", { "vh--no-click": !e.rightClick }]),
        onMouseenter: o[1] || (o[1] = (h) => l.isZoom(!0, "hover")),
        onMouseleave: o[2] || (o[2] = (h) => l.isZoom(!1, "hover")),
        onMousemove: o[3] || (o[3] = (...h) => l.mousePos && l.mousePos(...h)),
        ref: "vue-hover-zs",
        onClick: o[4] || (o[4] = (h) => l.isZoom(!t.zoomed, "click"))
      }, [
        d("picture", {
          class: u({ "vh--none": t.zoomed })
        }, [
          (m(!0), n(c, null, f(e.breakpoints, (h) => (m(), n(c, {
            key: h.width
          }, [
            h.regularWebp ? (m(), n("source", {
              key: 0,
              srcset: h.regularWebp,
              type: "image/webp",
              media: "(min-width:" + h.width + "px)"
            }, null, 8, L)) : r("", !0),
            h.regular ? (m(), n("source", {
              key: 1,
              srcset: h.regular,
              media: "(min-width:" + h.width + "px)"
            }, null, 8, Z)) : r("", !0)
          ], 64))), 128)),
          e.regularWebp ? (m(), n("source", {
            key: 0,
            srcset: e.regularWebp,
            type: "image/webp"
          }, null, 8, T)) : r("", !0),
          d("img", {
            loading: e.lazyload ? "lazy" : "eager",
            src: e.regular,
            class: u(e.imgClass),
            alt: e.alt,
            onLoad: o[0] || (o[0] = (h) => (s.$emit("regularLoaded"), t.showSlot = !1)),
            width: e.imgWidth,
            height: e.imgHeight
          }, null, 42, P)
        ], 2),
        t.zoomed ? (m(), n("picture", H, [
          (m(!0), n(c, null, f(e.breakpoints, (h) => (m(), n(c, {
            key: h.width
          }, [
            h.zoomWebp ? (m(), n("source", {
              key: 0,
              srcset: h.zoomWebp,
              type: "image/webp",
              media: "(min-width:" + h.width + "px)"
            }, null, 8, X)) : h.regularWebp ? (m(), n("source", {
              key: 1,
              srcset: h.regularWebp,
              type: "image/webp",
              media: "(min-width:" + h.width + "px)"
            }, null, 8, Y)) : r("", !0),
            h.zoom ? (m(), n("source", {
              key: 2,
              srcset: h.zoom,
              media: "(min-width:" + h.width + "px)"
            }, null, 8, S)) : h.regular ? (m(), n("source", {
              key: 3,
              srcset: h.regular,
              media: "(min-width:" + h.width + "px)"
            }, null, 8, C)) : r("", !0)
          ], 64))), 128)),
          t.options.zoomWebp ? (m(), n("source", {
            key: 0,
            src: t.options.zoomWebp,
            type: "image/webp"
          }, null, 8, E)) : r("", !0),
          t.touch ? (m(), n("img", {
            key: 2,
            src: t.options.zoom,
            class: "vh--image vh--abs",
            style: z("width:" + t.zoomWidth + "px;transform:" + t.touchPosition)
          }, null, 12, I)) : (m(), n("img", {
            key: 1,
            src: t.options.zoom,
            class: "vh--image vh--abs",
            style: z({ width: t.zoomWidth + "px", transform: "translate(-" + t.x + "px,-" + t.y + "px)" })
          }, null, 12, B))
        ])) : r("", !0),
        g(v, { name: "VueHoverfade" }, {
          default: p(() => [
            !t.zoomed && !t.loading && !e.clickZoom && !t.touch && e.showMessage ? (m(), n("div", {
              key: 0,
              class: u(["vh--message vh--abs vh--flex vh--jc vh--ai", "vh--message-" + e.messagePos]),
              innerHTML: e.hoverMessage
            }, null, 10, V)) : !t.zoomed && !t.loading && !t.touch && e.showMessage ? (m(), n("div", {
              key: 1,
              class: u(["vh--message vh--abs vh--flex vh--jc vh--ai", "vh--message-" + e.messagePos]),
              innerHTML: e.clickMessage
            }, null, 10, j)) : !t.zoomed && !t.loading && t.touch && e.showMessageTouch ? (m(), n("div", {
              key: 2,
              class: u(["vh--message vh--abs vh--flex vh--jc vh--ai", "vh--message-" + e.messagePos]),
              innerHTML: e.touchMessage
            }, null, 10, D)) : r("", !0)
          ]),
          _: 1
        })
      ], 34),
      g(v, { name: "VueHoverfade" }, {
        default: p(() => [
          t.touch && t.zoomed && t.loaded && !e.tapToClose ? (m(), n("div", {
            key: 0,
            class: u(["vh--close vh--abs vh--flex vh--jc vh--ai", "vh--" + e.closePos]),
            onClick: o[5] || (o[5] = b((h) => (t.zoomed = !1, s.$emit("offZoom")), ["stop"])),
            innerHTML: "×"
          }, null, 2)) : t.loading ? (m(), n("div", O, [...o[6] || (o[6] = [
            d("div", {
              class: "vh--loading",
              innerHTML: "◠"
            }, null, -1)
          ])])) : r("", !0)
        ]),
        _: 1
      })
    ])), [
      [a, l.isZoom],
      [W, !t.showSlot || e.lazyload]
    ])
  ], 64);
}
const N = /* @__PURE__ */ k(A, [["render", F]]), Q = {
  install: (s, o) => {
    s.component("VueImageZoomer", N);
  }
};
export {
  N as VueImageZoomer,
  Q as default
};
