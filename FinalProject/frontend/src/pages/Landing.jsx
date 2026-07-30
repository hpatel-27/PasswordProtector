import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <PageHeader />

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-12 py-14 text-center shadow-md">
          <h1 className="mb-4 text-4xl leading-tight">
            Keep every password safe and within reach
          </h1>
          <p className="mx-auto mb-8 max-w-md text-lg text-slate-500">
            A simple, secure home for your logins. Store accounts by provider,
            encrypted at rest and ready when you need them.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn btn-primary min-w-[150px] px-6 py-3" id="signupBtn">
              Get started
            </Link>
            <Link to="/login" className="btn btn-secondary min-w-[150px] px-6 py-3" id="loginBtn">
              Log in
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
