import { CTASection, FeaturesSection, Footer, HeroSection } from "@/components/landing";
import { LandingLayout } from "@/layouts/landing/layout";

export default function LandingPage() {
	return (
		<LandingLayout>
			<HeroSection />
			<FeaturesSection />
			<CTASection />
			<Footer />
		</LandingLayout>
	);
}
