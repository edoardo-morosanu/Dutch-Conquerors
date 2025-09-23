import translate from "google-translate-api-x";

/**
 * Translation Service with CORS proxy fallback for google-translate-api-x
 */
class TranslationService {
    constructor() {
        // CORS proxy URLs for fallback
        this.corsProxies = [
            "https://api.allorigins.win/get?url=",
            "https://corsproxy.io/?",
        ];

        this.localDictionary = {
            // Maritime/Historical terms
            ship: "schip",
            sail: "zeilen",
            sea: "zee",
            ocean: "oceaan",
            captain: "kapitein",
            crew: "bemanning",
            treasure: "schat",
            gold: "goud",
            island: "eiland",
            coast: "kust",
            harbor: "haven",
            port: "poort",
            wind: "wind",
            storm: "storm",
            anchor: "anker",
            compass: "kompas",
            map: "kaart",
            voyage: "reis",
            explorer: "ontdekkingsreiziger",
            trade: "handel",
            merchant: "koopman",
            colony: "kolonie",
            spice: "specerij",
            cannon: "kanon",
            fleet: "vloot",
            admiral: "admiraal",
            battle: "slag",
            victory: "overwinning",
            conquest: "verovering",
            empire: "rijk",

            // Common words
            hello: "hallo",
            goodbye: "tot ziens",
            yes: "ja",
            no: "nee",
            thank: "dank",
            please: "alsjeblieft",
            water: "water",
            fire: "vuur",
            earth: "aarde",
            air: "lucht",
            house: "huis",
            cat: "kat",
            dog: "hond",
            bird: "vogel",
            fish: "vis",
            tree: "boom",
            flower: "bloem",
            sun: "zon",
            moon: "maan",
            star: "ster",
            book: "boek",
            food: "eten",
            drink: "drinken",
            love: "liefde",
            friend: "vriend",
            family: "familie",
            time: "tijd",
            day: "dag",
            night: "nacht",
            morning: "ochtend",
            evening: "avond",
        };
    }

    /**
     * Main translation method with fallback chain
     */
    async translate(text, sourceLang = "EN", targetLang = "NL") {
        if (!text || typeof text !== "string") {
            return null;
        }

        const cleanText = text.trim().toLowerCase();

        // Try DeepL API first (primary method)
        try {
            const deeplResult = await this.translateWithDeepL(
                text,
                sourceLang,
                targetLang,
            );
            if (deeplResult) {
                console.log(
                    `✅ DeepL translation: "${text}" → "${deeplResult}"`,
                );
                return deeplResult;
            }
        } catch (error) {
            console.warn("DeepL translation failed:", error.message);
        }

        // Fallback 1: Google Translate API X with default client
        try {
            const googleResult = await this.translateWithGoogle(
                text,
                sourceLang,
                targetLang,
            );
            if (googleResult) {
                console.log(
                    `✅ Google Translate (default) translation: "${text}" → "${googleResult}"`,
                );
                return googleResult;
            }
        } catch (error) {
            console.warn("Google Translate (default) failed:", error.message);
        }

        // Fallback 2: Google Translate API X with 'gtx' client (for 403 errors)
        try {
            const googleGtxResult = await this.translateWithGoogle(
                text,
                sourceLang,
                targetLang,
                "gtx",
            );
            if (googleGtxResult) {
                console.log(
                    `✅ Google Translate (GTX) translation: "${text}" → "${googleGtxResult}"`,
                );
                return googleGtxResult;
            }
        } catch (error) {
            console.warn("Google Translate (GTX) failed:", error.message);
        }

        // Fallback 3: Local dictionary lookup
        if (targetLang === "NL" && this.localDictionary[cleanText]) {
            console.log(
                `✅ Local dictionary translation: "${text}" → "${this.localDictionary[cleanText]}"`,
            );
            return this.localDictionary[cleanText];
        }

        // All methods failed
        console.error(`❌ All translation methods failed for: "${text}"`);
        return null;
    }

    /**
     * DeepL API translation via proxy
     */
    async translateWithDeepL(text, sourceLang, targetLang) {
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: text,
                source_lang: sourceLang,
                target_lang: targetLang,
            }),
        });

        if (!response.ok) {
            throw new Error(`DeepL API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.code === 200 && data.data) {
            return data.data;
        }

        throw new Error("DeepL API returned invalid response format");
    }

    /**
     * Google Translate API X translation with CORS proxy fallback
     */
    async translateWithGoogle(
        text,
        sourceLang,
        targetLang,
        client = undefined,
    ) {
        // First try direct API call
        try {
            const options = {
                from: sourceLang.toLowerCase(),
                to: targetLang.toLowerCase(),
            };

            // Add client option if specified (for 403 error handling)
            if (client) {
                options.client = client;
            }

            const result = await translate(text, options);

            if (result && result.text) {
                return result.text;
            }
        } catch (error) {
            // If CORS error, try CORS proxy fallback
            if (
                error.message.includes("CORS") ||
                error.message.includes("NetworkError")
            ) {
                return await this.translateWithCorsProxy(
                    text,
                    sourceLang,
                    targetLang,
                );
            }
            throw error;
        }

        throw new Error("Google Translate API returned invalid response");
    }

    /**
     * Fallback using CORS proxy for Google Translate
     */
    async translateWithCorsProxy(text, sourceLang, targetLang) {
        const params = new URLSearchParams({
            client: "gtx",
            sl: sourceLang.toLowerCase(),
            tl: targetLang.toLowerCase(),
            dt: "t",
            q: text,
        });

        const googleUrl = `https://translate.googleapis.com/translate_a/single?${params}`;

        for (const proxy of this.corsProxies) {
            try {
                const proxyUrl = proxy + encodeURIComponent(googleUrl);
                const response = await fetch(proxyUrl);

                if (!response.ok) continue;

                let data;
                if (proxy.includes("allorigins.win")) {
                    const json = await response.json();
                    data = JSON.parse(json.contents);
                } else {
                    data = await response.json();
                }

                if (data && data[0] && data[0][0] && data[0][0][0]) {
                    return data[0][0][0];
                }
            } catch (error) {
                console.warn(`CORS proxy ${proxy} failed:`, error.message);
                continue;
            }
        }

        throw new Error("All CORS proxies failed");
    }

    /**
     * Batch translation method for multiple words
     */
    async translateWords(words, sourceLang = "EN", targetLang = "NL") {
        if (!Array.isArray(words) || words.length === 0) {
            return [];
        }

        // Process translations in parallel
        const promises = words.map(async (word) => {
            try {
                const translation = await this.translate(
                    word,
                    sourceLang,
                    targetLang,
                );

                // Filter out words that don't translate or are identical
                if (
                    !translation ||
                    translation.toLowerCase().trim() ===
                        word.toLowerCase().trim()
                ) {
                    return null;
                }

                return {
                    english: word,
                    dutch: translation,
                };
            } catch (error) {
                console.warn(
                    `Failed to translate word "${word}":`,
                    error.message,
                );
                return null;
            }
        });

        const results = await Promise.all(promises);

        // Filter out null results
        return results.filter((result) => result !== null);
    }
}

// Export singleton instance
const translationService = new TranslationService();
export default translationService;
