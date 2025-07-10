
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user came from the welcome page
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    // If not coming from the same origin or no referrer, redirect to home
    if (!referrer || !referrer.startsWith(currentOrigin)) {
      navigate("/", { replace: true });
      return;
    }

    // Check if the referrer is the welcome page
    const referrerPath = new URL(referrer).pathname;
    if (referrerPath !== "/") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src="/fittrackpro-logo.jpg" 
              alt="FitTrack Pro Logo" 
              className="h-10 w-10 rounded-lg shadow-lg shadow-green-500/20"
            />
            <div className="text-2xl font-bold text-green-400">FitTrack Pro</div>
          </div>
          <Button 
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-green-500/10"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-green-400 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
            </p>
            <h3 className="text-lg font-medium text-white mb-2">Personal Information:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Name and email address</li>
              <li>Fitness goals and preferences</li>
              <li>Workout history and progress data</li>
              <li>Body measurements and health metrics</li>
              <li>Device and usage information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your fitness experience</li>
              <li>Track your progress and provide insights</li>
              <li>Send you updates and promotional materials (with your consent)</li>
              <li>Respond to your comments and questions</li>
              <li>Ensure the security of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing and Disclosure</h2>
            <p className="mb-4">
              We do not sell, rent, or share your personal information with third parties except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and the safety of our users</li>
              <li>With service providers who assist us in operating our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Health Data</h2>
            <p>
              Your health and fitness data is particularly sensitive. We take extra precautions to protect this information and will never share it without your explicit consent, except as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights and Choices</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of promotional communications</li>
              <li>Request a copy of your data</li>
              <li>Object to certain processing activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us through our support channels.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
