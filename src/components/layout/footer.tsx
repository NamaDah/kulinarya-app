"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍜</span>
              <span className="text-xl font-bold font-heading text-white">
                Kulinarya
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-heading">
              {t("footer.explore")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-amber-400 transition-colors"
                >
                  {t("footer.shopIngredients")}
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  className="hover:text-amber-400 transition-colors"
                >
                  {t("footer.browseRecipes")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-amber-400 transition-colors"
                >
                  {t("footer.myCart")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cuisines */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-heading">
              {t("footer.cuisines")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/shop?cuisine=chinese"
                  className="hover:text-red-400 transition-colors"
                >
                  🇨🇳 {t("cuisines.chinese")}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?cuisine=japanese"
                  className="hover:text-pink-400 transition-colors"
                >
                  🇯🇵 {t("cuisines.japanese")}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?cuisine=korean"
                  className="hover:text-orange-400 transition-colors"
                >
                  🇰🇷 {t("cuisines.korean")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-stone-700 mt-8 pt-6 text-center text-xs text-stone-500">
          <p>
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
