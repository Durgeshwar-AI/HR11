import { Btn } from "../../assets/components/shared/Btn";
import { PublicNav } from "../../assets/components/layout/PublicNav";
import { useNavigate } from "react-router-dom";

export function RoleChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-tertiary">
      <PublicNav />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-60px)] px-6">
        <h1 className="font-display font-black text-[clamp(2rem,5vw,4rem)] uppercase tracking-tight text-secondary mb-8 text-center">
          Who are you?
        </h1>
        <div className="flex flex-col sm:flex-row gap-6">
          <Btn onClick={() => navigate("/company-home")} style={{ minWidth: 220, fontSize: 16 }}>
            I&rsquo;m an HR / Company
          </Btn>
          <Btn variant="secondary" onClick={() => navigate("/candidate-home")} style={{ minWidth: 220, fontSize: 16 }}>
            I&rsquo;m looking for a job
          </Btn>
        </div>
      </div>
    </div>
  );
}
