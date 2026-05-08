import {
  FacebookFilled,
  GlobalOutlined,
  InstagramFilled,
  LinkedinFilled,
  YoutubeFilled,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

export default function WebsiteFooter() {
  return (
    <footer className="mt-10 overflow-hidden bg-[linear-gradient(135deg,#a92e23_0%,#b53c31_45%,#9f2c24_100%)] text-white">
      <div className="website-footer-pattern px-6 py-10 md:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="display-font max-w-[320px] text-[20px] font-medium leading-10 text-[#ffd3c8]">
              Career Map - shaping futures, one step at a time.
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              {[YoutubeFilled, LinkedinFilled, InstagramFilled, GlobalOutlined, FacebookFilled].map((Icon, index) => (
                <div key={index} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[20px] text-[#c6362a]">
                  <Icon />
                </div>
              ))}
            </div>
          </div>

        

          <div>
            <div className="display-font mb-4 text-[22px] font-bold">Reach Us</div>
            <div className="grid gap-6 text-[15px] leading-8 text-white/95">
              <div>Student & parent career guidance portal</div>
              <div>support@careermap.local</div>
              <div>+91 97768 08179, +91 94372 08179</div>
              <div>Career guidance modules, assessments, mentoring, scholarships, and study abroad support.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-white/8 px-6 py-5 text-center text-[15px] text-[#ffd9d2] md:px-10">
        Copyright 2025. All rights reserved. Designed & developed for Career Map website experience.
      </div>
    </footer>
  );
}
