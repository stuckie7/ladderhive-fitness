import FitbitLoginButton from '../components/FitbitLoginButton';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to LadderHive Fitness
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Connect your Fitbit to get started
        </p>
        <div className="text-center">
          <FitbitLoginButton />
        </div>
      </div>
    </main>
  );
}
