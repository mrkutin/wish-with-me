import Link from 'next/link'
import { ArrowRight, Heart, Gift, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <main>
        {/* Hero Section */}
        <section className="px-6 py-24 sm:py-32 relative isolate">
          <div className="absolute -z-10 right-5 top-10">
            <Heart className="h-24 w-24 text-accent/10 rotate-12" />
          </div>
          <div className="absolute -z-10 left-10 bottom-10">
            <Gift className="h-16 w-16 text-accent/10 -rotate-12" />
          </div>
          
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8 flex items-center justify-center">
              <span className="inline-flex items-center gap-x-2 rounded-full bg-accent/10 px-4 py-1 text-sm text-accent ring-1 ring-accent/20">
                <Star className="h-4 w-4 fill-accent" />
                Create your first wishlist for free
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Create and share your wishlists
              <br />
              <span className="text-primary">with anyone, anywhere</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Make gift-giving easier. Create personalized wishlists, share them with friends and family,
              and keep track of your shopping - all in one place.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              >
                Create your wishlist
                <ArrowRight className="ml-2 inline-block h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-accent transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-background-alt px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
              Everything you need to manage your wishlists
            </h2>
            <p className="text-center text-text-secondary mb-16 max-w-2xl mx-auto">
              Simple tools to help you create and share your perfect wishlist. 
              <span className="text-accent font-medium"> Start for free today!</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group bg-background-card p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-border hover:border-accent/20"
                >
                  <div className="w-12 h-12 bg-background-alt rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Add a new testimonial section with accent elements */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <Heart className="h-8 w-8 text-accent mx-auto" fill="currentColor" />
            </div>
            <blockquote>
              <p className="text-xl font-medium text-text-primary">
                "WishWithMe made organizing our wedding registry so much easier! 
                Our guests loved how simple it was to find and purchase gifts."
              </p>
            </blockquote>
            <div className="mt-6">
              <div className="text-accent font-semibold">Sarah & John</div>
              <div className="text-text-secondary text-sm">Recently Married</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">WishWithMe</h3>
              <p className="text-sm">Making gift-giving easier for everyone.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            © {new Date().getFullYear()} WishWithMe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Create Wishlists',
    description: 'Create and organize your wishlists for any occasion. Add items, set priorities, and keep everything organized.',
    icon: function ListIcon(props: any) {
      return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    }
  },
  {
    title: 'Share with Anyone',
    description: 'Share your wishlists with friends and family via email or link. Control who can see and edit your lists.',
    icon: function ShareIcon(props: any) {
      return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )
    }
  },
  {
    title: 'Track Purchases',
    description: 'Keep track of purchased items and avoid duplicate gifts. Perfect for birthdays, holidays, and special occasions.',
    icon: function CartIcon(props: any) {
      return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  }
]
