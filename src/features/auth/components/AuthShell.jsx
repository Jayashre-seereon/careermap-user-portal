import { Link } from "react-router-dom";
import Bee from "../../../asset/bee.png";
import Logo from "../../../asset/logo_white.png";
export function AuthShell({ children, title, subtitle, backTo }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#faf8f7" }}>
      <div
        className="auth-left-panel"
        style={{
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "42%",
          background: "linear-gradient(160deg, #9a2119 0%, #c0392b 55%, #7b1a13 100%)",
          padding: "48px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[
          [320, -80, null, -80, null],
          [220, -40, null, -40, null],
          [360, null, -100, null, -60],
          [200, null, 60, null, -20],
        ].map(([size, top, bottom, right, left], index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: top !== null ? top : undefined,
              bottom: bottom !== null ? bottom : undefined,
              right: right !== null ? right : undefined,
              left: left !== null ? left : undefined,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `2px solid rgba(255,255,255,${0.06 + (index % 2) * 0.06})`,
            }}
          />
        ))}

        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "28px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          }}
        >
          <img src={Bee} alt="Career Map" style={{ width: "84px", height: "84px", objectFit: "contain" }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: "26px", fontWeight: "700", color: "#fff", marginBottom: "10px", letterSpacing: "-0.5px" }}>
            Career Map
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.72)", lineHeight: "1.6", maxWidth: "220px" }}>
            Discover your future with personalised guidance tailored just for you.
          </div>
        </div>

        {[
          ["*", "500+ Career Options"],
          ["*", "Expert Mentors"],
          ["*", "Scholarships & Exams"],
        ].map(([icon, label]) => (
          <div
            key={label}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.88)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#ffb3ae" }}>{icon}</span>
            {label}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>
          {backTo ? (
            <Link
              to={backTo}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#9a2119",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "20px",
                textDecoration: "none",
              }}
            >
              {"<-"} Back
            </Link>
          ) : null}

          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(154,33,25,0.08)",
              padding: "36px 32px",
              border: "1px solid rgba(154,33,25,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <div
               
              >
                <img src={Logo} alt="" style={{ width: "100px", height: "32px", objectFit: "contain" }} />
              </div>
               </div>

            {title ? (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a0a09", letterSpacing: "-0.4px", marginBottom: "4px", fontFamily: "'Georgia', serif" }}>
                  {title}
                </div>
                {subtitle ? <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.5" }}>{subtitle}</div> : null}
              </div>
            ) : null}

            {children}
          </div>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "#bbb" }}>
            Copyright {new Date().getFullYear()} Career Map | All rights reserved
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left-panel { display: flex !important; } }
        .cm-primary-btn {
          border-radius: 10px !important; font-weight: 700 !important; height: 46px !important;
          background: linear-gradient(135deg, #9a2119 0%, #c0392b 100%) !important;
          border-color: #9a2119 !important;
          box-shadow: 0 4px 14px rgba(154,33,25,0.28) !important;
          font-size: 14px !important; letter-spacing: 0.2px !important;
          transition: opacity 0.2s, transform 0.15s !important;
        }
        .cm-primary-btn:hover:not(:disabled) { opacity: 0.9 !important; transform: translateY(-1px) !important; }
        .cm-primary-btn:disabled { background: #e5ccc9 !important; border-color: #e5ccc9 !important; box-shadow: none !important; color: #fff !important; }
        .cm-input-field { border-radius: 10px !important; border-color: #e2d5d4 !important; }
        .cm-input-field:hover { border-color: #c0392b !important; }
        .cm-input-field:focus, .cm-input-field-focused { border-color: #9a2119 !important; box-shadow: 0 0 0 3px rgba(154,33,25,0.10) !important; }
        .cm-form-label .ant-form-item-label > label { font-size: 13px !important; font-weight: 700 !important; color: #4a2020 !important; }
        .cm-otp .ant-otp-input { border-radius: 12px !important; border-color: #e2d5d4 !important; font-size: 20px !important; font-weight: 800 !important; width: 56px !important; height: 56px !important; color: #9a2119 !important; }
        .cm-otp .ant-otp-input:focus { border-color: #9a2119 !important; box-shadow: 0 0 0 3px rgba(154,33,25,0.12) !important; }
        .cm-grid-btn .ant-btn-primary { background: linear-gradient(135deg, #9a2119, #c0392b) !important; border-color: #9a2119 !important; }
        .cm-grid-btn .ant-btn-default { border-color: #e2d5d4 !important; color: #4a2020 !important; }
        .cm-grid-btn .ant-btn-default:hover { border-color: #9a2119 !important; color: #9a2119 !important; background: #fdf5f5 !important; }
        .cm-step-active { background: linear-gradient(135deg, #9a2119, #c0392b) !important; border-color: #9a2119 !important; color: #fff !important; }
        .cm-step-done { background: #f7ece8 !important; border-color: #e2ccc9 !important; color: #9a2119 !important; }
        .cm-step-pending { background: #fff !important; border-color: #e5e7eb !important; color: #bbb !important; }
        .cm-promo-item { border-radius: 14px !important; border: 1.5px solid #ede8e7 !important; padding: 14px 16px !important; background: #fff !important; transition: border-color 0.2s, box-shadow 0.2s !important; display: flex; align-items: center; gap: 14px; }
        .cm-promo-item:hover { border-color: #9a2119 !important; box-shadow: 0 2px 10px rgba(154,33,25,0.08) !important; }
        .cm-entry-card { border-radius: 16px; border: 1.5px solid #ede8e7; padding: 16px 18px; cursor: pointer; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; background: #fff; display: block; text-decoration: none; }
        .cm-entry-card:hover { border-color: #9a2119; background: #fdf5f5; box-shadow: 0 4px 16px rgba(154,33,25,0.10); }
      `}</style>
    </div>
  );
}
