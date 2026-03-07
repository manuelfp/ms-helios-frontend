import { useContext } from "react";

import { PrivacyContext } from "@/contexts/privacy";

export function usePrivacy() {
	return useContext(PrivacyContext);
}
