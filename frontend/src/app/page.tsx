import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif text-primary">
            ✦ LUMIS
          </h1>
          <p className="text-xl text-secondary italic">
            the quiet light that helps you finally see a person clearly
          </p>
        </div>

        <div className="card space-y-6">
          <p className="text-lg text-primary">
            A private, AI-powered personal intelligence tool that helps you understand 
            the people in your life — and more importantly, understand how they make 
            you feel and why.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/login" className="btn btn-primary">
              Get Started
            </Link>
            <Link href="/signup" className="btn btn-secondary">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="text-sm text-tertiary space-y-2">
          <p>🎨 Design system loaded</p>
          <p>🚀 Frontend running on port 3000</p>
          <p>📚 Check QUICKSTART.md for setup instructions</p>
        </div>
      </div>
    </main>
  );
}
