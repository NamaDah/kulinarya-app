import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍜</span>
              <span className="text-xl font-bold font-[family-name:var(--font-heading)] text-white">
                Kulinarya
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Discover authentic Pan-Asian recipes and shop premium Chinese,
              Japanese, and Korean ingredients for your kitchen.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-[family-name:var(--font-heading)]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-amber-400 transition-colors"
                >
                  Shop Ingredients
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  className="hover:text-amber-400 transition-colors"
                >
                  Browse Recipes
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-amber-400 transition-colors"
                >
                  My Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Cuisines */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-[family-name:var(--font-heading)]">
              Cuisines
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/shop?cuisine=chinese"
                  className="hover:text-red-400 transition-colors"
                >
                  🇨🇳 Chinese
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?cuisine=japanese"
                  className="hover:text-pink-400 transition-colors"
                >
                  🇯🇵 Japanese
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?cuisine=korean"
                  className="hover:text-orange-400 transition-colors"
                >
                  🇰🇷 Korean
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-stone-700 mt-8 pt-6 text-center text-xs text-stone-500">
          <p>
            &copy; {new Date().getFullYear()} Kulinarya. Made with ❤️ for food
            lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
