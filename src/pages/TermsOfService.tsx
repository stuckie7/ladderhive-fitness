
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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
        <h1 className="text-4xl font-bold text-green-400 mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FitTrack Pro, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of FitTrack Pro per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained in FitTrack Pro</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Disclaimer</h2>
            <p>
              The materials on FitTrack Pro are provided on an 'as is' basis. FitTrack Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Health and Fitness Disclaimer</h2>
            <p>
              FitTrack Pro is not a medical application and should not be used as a substitute for professional medical advice. Always consult with a healthcare provider before beginning any fitness program. Use of our fitness tracking and workout features is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Limitations</h2>
            <p>
              In no event shall FitTrack Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use FitTrack Pro, even if FitTrack Pro or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our support channels.
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

export default TermsOfService;
