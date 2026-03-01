import { Btn } from "../shared/Btn";
import { useNavigate, useLocation } from "react-router-dom";

interface PublicNavProps {
  onNavigate?: (target: string) => void;
  currentPage?: string;
}

export function PublicNav(props: PublicNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname || "/";
  const go = (path: string) => {
    if (props.onNavigate) props.onNavigate(path);
    else navigate(path);
  };

  const links = [
    { key: "company-home", label: "Company Home", path: "/company-home" },
    { key: "how", label: "How It Works", path: "/how-it-works" },
    { key: "pricing", label: "Pricing", path: "/pricing" },
  ];

  return (
    <nav className="flex items-center justify-between px-12 h-[62px] bg-tertiary border-b-2 border-secondary sticky top-0 z-[100]">
      <div
        onClick={() => go("/")}
        className="font-display font-black text-[22px] text-secondary cursor-pointer flex items-center gap-1"
      >
        Prompt<span className="text-primary">Hire</span>
      </div>

      <div className="flex gap-8 items-center">
        {links.map((l) => (
          <span
            key={l.key}
            onClick={() => go(l.path)}
            className={[
              "font-body font-medium text-[13px] cursor-pointer pb-0.5 transition-all duration-150",
              pathname === l.path
                ? "text-primary border-b-2 border-primary"
                : "text-ink-light border-b-2 border-transparent",
            ].join(" ")}
          >
            {l.label}
          </span>
        ))}
        <div className="w-px h-5 bg-border-clr" />
        {/* Only show applicant login/signup on candidate pages; only show company login/signup on company pages. */}
        {pathname.includes("candidate") ? (
          <>
            <Btn
              size="sm"
              variant="secondary"
              onClick={() => go("/candidate-login")}
            >
              Login
            </Btn>
            <Btn size="sm" onClick={() => go("/candidate-register")}>
              Sign Up
            </Btn>
          </>
        ) : pathname.includes("company") ? (
          <>
            <Btn
              size="sm"
              variant="secondary"
              onClick={() => go("/company-login")}
            >
              Company Login
            </Btn>
            <Btn size="sm" onClick={() => go("/company-register")}>
              Get Started Free
            </Btn>
          </>
        ) : (
          <></>
        )}
      </div>
    </nav>
  );
}
