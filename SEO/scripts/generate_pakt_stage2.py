#!/usr/bin/env python3
"""Generate Stage 2A Pakt SEO pages and supporting index files."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SITE = "https://www.lingofonex.com"
STAGE2_LASTMOD = "2026-06-22"
ASSET_VERSION = "public-fixes-53"

PLAY_STORE_URL = (
    "https://play.google.com/store/apps/details?id=com.lingofonex.android"
    "&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
)
APP_STORE_URL = "https://apps.apple.com/us/app/lingofonex/id6504121499?itsct=apps_box_badge&itscg=30200"
PAKT_FIGMA_LOGO_URL = f"{SITE}/images/pakt-wordmark-white.png"
PAKT_FIGMA_SOCIAL_IMAGE_URL = f"{SITE}/images/pakt-figma-hero-bg.png"


def e(value: object) -> str:
    return html.escape(str(value), quote=True)


def page_url(slug: str) -> str:
    return f"{SITE}/pakt/{slug}/"


def local_page_path(slug: str) -> Path:
    return ROOT / "pakt" / slug / "index.html"


def scenario_key(title: str) -> str:
    key = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    if key in {"train-stations", "stations"}:
        return "stations"
    return key


def proof_status_description(label: str) -> str:
    descriptions = {
        "Airplane mode": "Use Pakt after downloading languages, even with mobile data and WiFi switched off.",
        "No WiFi": "Keep translating when hotel, airport, or station WiFi is unavailable.",
        "Weak signal": "Avoid waiting on unreliable network requests when the conversation is already happening.",
    }
    return descriptions.get(label, f"Use Pakt when {label.lower()} makes online translation unreliable.")


COMMON_LANGUAGE_PILLS = [
    ("Japanese", "Japan trips"),
    ("Spanish", "Spain and Latin America"),
    ("French", "France travel"),
    ("Italian", "Italy travel"),
    ("German", "DACH travel"),
    ("Portuguese", "Portugal and Brazil"),
]

COMPACT_LANGUAGE_MATRIX = [
    ("English", "English"),
    ("Italiano", "Italian"),
    ("ไทย", "Thai"),
    ("العربية", "Arabic"),
    ("日本語", "Japanese"),
    ("中文", "Chinese"),
    ("Español", "Spanish"),
    ("Português", "Portuguese"),
    ("Français", "French"),
    ("Русский", "Russian"),
    ("Deutsch", "German"),
    ("한국어", "Korean"),
]

EXPANDED_LANGUAGE_MODAL = (COMPACT_LANGUAGE_MATRIX * 8)[:88]

EXPANDED_LANGUAGE_LIST = [
    ("日本語", "Japanese"),
    ("Español", "Spanish"),
    ("Français", "French"),
    ("Italiano", "Italian"),
    ("Deutsch", "German"),
    ("Português", "Portuguese"),
    ("한국어", "Korean"),
    ("中文", "Chinese"),
    ("العربية", "Arabic"),
    ("Türkçe", "Turkish"),
    ("Nederlands", "Dutch"),
    ("Polski", "Polish"),
    ("Українська", "Ukrainian"),
    ("Ελληνικά", "Greek"),
    ("Čeština", "Czech"),
    ("Svenska", "Swedish"),
    ("Dansk", "Danish"),
    ("Norsk", "Norwegian"),
]


PAGES = [
    {
        "slug": "offline-translator-app",
        "title": "Offline Translator App - Pakt by Lingofonex",
        "meta": "Pakt is an offline translator app for travel. Translate in 100 languages and hear voice output in 49 when WiFi, roaming, or signal fails.",
        "h1": "Offline translation for real-world conversations.",
        "crumb": "Offline Translator App",
        "eyebrow": "Offline translator app",
        "lede": "Pakt works on your phone — no data, no roaming, no sign-in. Buy it once, use it everywhere.",
        "final_cta_body": "Get your offline translator ready before you leave",
        "min_words": 900,
        "hero_dialogue": (
            "Can you take me to this hotel?",
            "Claro. I can take you there now.",
        ),
        "trust": [
            "Translate in 100 languages",
            "Voice output in 49 languages",
            "Works offline after downloads",
            "Built for travel situations",
        ],
        "sections": [
            {
                "type": "situation",
                "kicker": "The situation",
                "title": "You land. WiFi is weak. Roaming is expensive.",
                "lede": "And you still need to talk to taxi drivers, hotel staff, restaurants, pharmacies, and station agents.",
                "highlight": "Pakt doesn't.",
            },
            {
                "type": "features",
                "kicker": "Features",
                "title": "Built for the road.",
                "lede": "",
                "cards": [
                    ("Offline translation", "Models live on your phone. No internet needed once installed."),
                    ("Voice input", "Just talk. Pakt hears and translates in real conversation."),
                    ("Private by design", "Prepared offline translation stays on your phone."),
                    ("Travel ready", "Built for taxis, hotels, markets, pharmacies - the real road."),
                    ("No cloud", "Translation runs locally. Nothing sent to a server."),
                    ("Multi-language support", "Pick the pack for your trip, or unlock the world once."),
                ],
            },
            {
                "type": "steps",
                "kicker": "How it works",
                "title": "Set it up once. Use it anywhere",
                "steps": [
                    ("Download the app", "Free to try with 3 translations. Pick a pack when you're ready."),
                    ("Choose your languages", "Download them while you have WiFi at home. Once. Forever yours."),
                    ("Translate offline anywhere", "Airplane mode, basement, mountain, subway. It just works."),
                ],
            },
            {
                "type": "app_flow",
                "kicker": "How it works",
                "title": "Travel with confidence",
                "flow_cards": [
                    ("Speak", "Listen to natural voice playback."),
                    ("Translate", "Read the phrase clearly on screen."),
                    ("Hear", "Play it aloud when pronunciation matters."),
                ],
            },
            {
                "type": "scenarios",
                "kicker": "Scenarios",
                "title": "Wherever travel takes you.",
                "cards": [
                    ("Taxis", "Quick conversations when you need the ride to go right."),
                    ("Hotels", "Ask about check-in, luggage, room problems, and checkout."),
                    ("Restaurants", "Order food, ask about ingredients, and explain restrictions."),
                    ("Train stations", "Confirm platforms, transfers, tickets, and delays."),
                    ("Pharmacies", "Explain a basic need and understand simple instructions."),
                    ("Markets", "Ask about prices, sizes, quantities, and payment methods."),
                ],
            },
            {
                "type": "checklist",
                "kicker": "Checklist",
                "title": "Before you leave.",
                "lede": "Five things to do at home, while WiFi is good.",
                "items": [
                    ("Download languages before leaving", "Install everything before you travel."),
                    ("Test airplane mode", "Make sure translation works offline."),
                    ("Check voice input and output", "Check that speaking and listening work."),
                    ("Save the app on your home screen", "Keep it one tap away."),
                    ("Keep a backup power source", "Translation is useless on 1%."),
                ],
            },
            {
                "type": "metrics",
                "kicker": "Offline",
                "title": "Works when your connection does not",
                "lede": "Use Pakt when WiFi is unavailable, roaming is expensive, or signal is unreliable.",
                "status_chips": [
                    "Airplane mode",
                    "No WiFi",
                    "Weak signal",
                ],
            },
            {
                "type": "privacy_conversation",
                "privacy": {
                    "kicker": "Privacy",
                    "title": "Private translation without the cloud",
                    "body": "Pakt translates locally on your phone. Conversations never reach a server, never join a profile.",
                    "label": "On-device only",
                },
                "conversation": {
                    "kicker": "Conversations",
                    "title": "A real conversation, in two languages.",
                    "body": "Speak into the app and hear natural translations on both sides.",
                },
                "destination": {
                    "kicker": "Destination · Japan",
                    "title": "Offline translator for Japan travel.",
                    "body": "Download Japanese before your trip and translate offline in restaurants, taxis, hotels, train stations.",
                    "cta": "Download Japanese pack",
                    "image": "/images/pakt-destination-japan.png",
                    "alt": "Mount Fuji and Chureito Pagoda at sunset in Japan",
                },
            },
            {
                "type": "comparison",
                "kicker": "Comparison",
                "title": "How Pakt compares.",
                "lede": "",
                "columns": ["Feature", "Pakt", "Google Translate", "Apple Translate", "Others"],
                "rows": [
                    ["Works offline", "✓", "Limited", "Limited", "-"],
                    ["Voice translation", "✓", "Yes", "Yes", "Varies"],
                    ["No cloud / private", "✓", "No", "No", "No"],
                    ["Conversation mode", "✓", "Yes", "Yes", "Rare"],
                    ["No account needed", "✓", "Yes", "Yes", "Often no"],
                    ["One-time purchase", "✓", "Free / ads", "Free", "Subscription"],
                ],
            },
            {
                "type": "languages",
                "kicker": "Language support",
                "title": "Languages you can rely on",
                "lede": "Pakt supports translation in 100 languages and voice output in 49. Download what you need before the trip and test common phrases while connected.",
                "stats": [
                    ("100", "translation languages"),
                    ("49", "voice output languages"),
                ],
                "languages": COMMON_LANGUAGE_PILLS,
            },
            {
                "type": "copy",
                "kicker": "SEO guide",
                "title": "What to look for in an offline translator app.",
                "paragraphs": [
                    "A good offline translator app should be judged by what it can do after setup, not only by what it can do on a perfect connection. Travelers should check whether the app supports the language they need, whether voice output is available, whether the app can run in airplane mode after downloads, and whether it is easy to use quickly under pressure.",
                    "Airport WiFi can be slow, mobile roaming can be disabled, and a subway platform or hotel basement may have no usable signal. That is when a traveler still needs to ask for directions, confirm an address, explain a food allergy, or understand a short answer from someone nearby.",
                    "Voice output is especially important abroad. A translated sentence on screen can help, but spoken output can be faster in a taxi, hotel lobby, or station queue. Pakt supports voice output in 49 languages, so the app can help you communicate when pronunciation is unfamiliar or when the other person needs to hear the phrase rather than read it.",
                    "Preparation matters. Download Pakt and the required languages before the trip, test a few phrases at home, then try the same phrases with mobile data disabled. That small check makes the app part of your travel routine instead of a last-minute rescue attempt after connection has already failed.",
                    "For prepared offline languages, Pakt translates locally on your phone and does not require cloud translation. Product downloads, app store behavior, diagnostics, and policy details are handled separately, so the safe claim is simple: no cloud is required for offline translation after the needed languages are downloaded.",
                ],
            },
        ],
        "faqs": [
            ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
            ("Do I need to download languages before traveling?", "Yes. Download the languages you expect to use while WiFi is reliable, then test offline mode before leaving."),
            ("Can I use it in airplane mode?", "Yes. After preparation, Pakt can translate prepared languages when airplane mode is on."),
            ("Is offline translation private?", "For prepared offline languages, Pakt translates locally on your phone and does not require cloud translation."),
            ("What languages are supported?", "Pakt supports translation in 100 languages and voice output in 49 languages."),
            ("Is it useful for taxis, hotels, and restaurants?", "Yes. Pakt is useful for short travel conversations in taxis, hotels, restaurants, stations, pharmacies, and markets."),
        ],
    },
    {
        "slug": "offline-translator-for-travel",
        "title": "Offline Translator for Travel - Pakt by Lingofonex",
        "meta": "Download Pakt before your trip and translate offline while traveling. Use it in taxis, hotels, restaurants, airports, and more.",
        "h1": "Offline translator for travel",
        "crumb": "Offline Translator for Travel",
        "eyebrow": "Travel translator",
        "lede": "Download Pakt before you leave, prepare the languages you need, and translate when roaming, WiFi, or mobile signal is not there to help.",
        "min_words": 900,
        "hero_dialogue": (
            "I need to get to the train station.",
            "The station is ten minutes from here.",
        ),
        "trust": [
            "Prepare before departure",
            "Translate in taxis and hotels",
            "Works when roaming is off",
            "Voice output in 49 languages",
        ],
        "sections": [
            {
                "type": "copy_grid",
                "variant": "situation",
                "kicker": "Travel reality",
                "title": "The best time to prepare translation is before you need it.",
                "lede": "Most travel translation problems happen after the easy setup window has closed.",
                "paragraphs": [
                    "At home, WiFi is stable and you have time. After landing, the situation changes quickly. A taxi driver is waiting, the hotel desk needs a reservation name, the restaurant menu is unfamiliar, or the train announcement is unclear. That is when a travel translator should already be ready.",
                    "Pakt is built for the pre-trip workflow: install the app, choose the languages for the destination, download what is needed, and test offline translation before leaving. Once that is done, the app can help when roaming is disabled, airport WiFi is slow, or the phone has no signal.",
                    "This makes Pakt different from a translation habit that assumes every trip will have a reliable connection. Travel is full of dead zones. Preparation gives you a practical fallback for short conversations that still matter.",
                ],
                "cards": [
                    ("Airport arrival", "Ask where to find taxis, trains, buses, baggage help, or a meeting point."),
                    ("First ride", "Confirm the destination and ask whether card payment is accepted."),
                    ("Hotel check-in", "Ask about luggage, room issues, breakfast, or local directions."),
                ],
            },
            {
                "type": "checklist",
                "kicker": "Checklist",
                "title": "Before you leave home.",
                "lede": "Use this as a quick travel setup routine while WiFi is good.",
                "items": [
                    "Install Pakt and open it once before travel day.",
                    "Download the destination language and your home language.",
                    "Test a few phrases with mobile data disabled.",
                    "Save the App Store or Google Play page for updates before departure.",
                    "Pack a charger or power bank so offline translation is available when needed.",
                    "Practice key phrases for taxis, hotels, restaurants, pharmacies, and stations.",
                ],
            },
            {
                "type": "scenarios",
                "kicker": "Travel scenarios",
                "title": "Five places where offline translation earns its space on your phone.",
                "cards": [
                    ("Taxis", "Give the address, ask for the meter, confirm pickup points, and handle route changes."),
                    ("Hotels", "Ask about check-in, deposits, WiFi, room problems, luggage storage, and checkout time."),
                    ("Restaurants", "Order food, ask about ingredients, explain allergies, or request the bill."),
                    ("Airports", "Ask about gates, baggage, transfers, transportation, lost items, and delays."),
                    ("Train stations", "Confirm platforms, transfer directions, ticket machines, and service changes."),
                    ("Pharmacies", "Explain a simple symptom, ask for instructions, or confirm whether a product is available."),
                ],
            },
            {
                "type": "steps",
                "kicker": "How it works",
                "title": "A simple travel workflow.",
                "steps": [
                    ("Plan languages", "List the countries and situations where you expect to need translation."),
                    ("Download before departure", "Prepare the languages while WiFi is reliable and you have time to test."),
                    ("Use offline abroad", "Translate prepared languages when data is expensive, blocked, slow, or unavailable."),
                ],
            },
            {
                "type": "metrics",
                "kicker": "Offline proof",
                "title": "Built for travel, not just perfect connection demos.",
                "lede": "Pakt supports the trip pattern travelers actually face: prepare first, then translate later without depending on a live network request.",
                "metrics": [
                    ("100", "translation languages for broad travel coverage"),
                    ("49", "voice output languages for spoken results"),
                    ("3", "core travel moments: arrival, transit, and service counters"),
                ],
            },
            {
                "type": "copy",
                "band": True,
                "kicker": "Voice and conversation",
                "title": "When text is not enough, let the translation be heard.",
                "paragraphs": [
                    "Travel conversations are often brief but urgent. A driver may need to hear the destination. A hotel receptionist may need to understand a room issue. A restaurant server may need to hear a dietary restriction. In those cases, voice output can be more useful than a block of text on screen.",
                    "Pakt supports voice output in 49 languages. That gives travelers a way to communicate a translated phrase without guessing pronunciation. It is not a replacement for learning local basics, but it is a practical fallback when the phrase is too important to improvise.",
                ],
            },
            {
                "type": "languages",
                "kicker": "Language support",
                "title": "Download the languages for your itinerary.",
                "lede": "Pakt supports translation in 100 languages. For travel, the right setup is usually your home language plus the destination language, with voice output checked before departure when available.",
                "languages": COMMON_LANGUAGE_PILLS,
            },
            {
                "type": "copy",
                "kicker": "Travel guide",
                "title": "How to use Pakt as an offline translator for travel.",
                "paragraphs": [
                    "Start with your itinerary. If you are flying to Japan, Spain, France, or Italy, prepare the main destination language and the languages you use most often. If your trip crosses borders, check each country and download what you need before leaving home. The goal is to remove translation setup from the stressful parts of the trip.",
                    "Next, test real phrases. Try a taxi destination, a restaurant request, a hotel question, and a pharmacy sentence. Then turn off mobile data and repeat the same phrases. That quick practice makes the app feel familiar before you are standing in a noisy queue or asking for help with luggage.",
                    "Finally, keep expectations practical. Offline translation is strongest when you use clear, short sentences. Ask one thing at a time. Avoid slang. Confirm important details with names, addresses, maps, prices, or written numbers when needed. Pakt gives you a travel communication layer, and clear inputs make that layer more useful.",
                    "For many travelers, the best offline translator is the one that is ready before the trip starts. Pakt focuses on that preparation model so you can keep moving when connection is the weakest part of the plan.",
                ],
            },
        ],
        "faqs": [
            ("Why use an offline translator for travel?", "Because travel often puts you in places where roaming is expensive, WiFi is weak, or mobile signal is unavailable."),
            ("When should I download languages?", "Download languages before leaving home or while you have reliable WiFi before the part of the trip where you need them."),
            ("Can I use Pakt in taxis and hotels?", "Yes. Pakt is built for practical travel conversations in taxis, hotels, restaurants, stations, airports, and similar places."),
            ("Does Pakt replace learning basic phrases?", "No. Basic local phrases are still useful. Pakt helps when the phrase is longer, unfamiliar, or important enough to translate clearly."),
            ("Does Pakt support voice output?", "Yes. Pakt supports voice output in 49 languages, depending on the selected language."),
            ("What should I test before leaving?", "Test destination, hotel, restaurant, pharmacy, and transport phrases, then repeat them with mobile data disabled."),
            ("Is Pakt private for offline travel translation?", "For prepared offline languages, Pakt translates locally on your phone and does not require cloud translation."),
        ],
    },
    {
        "slug": "voice-speech-translator",
        "title": "Offline Voice & Speech Translator - Pakt",
        "meta": "Speak, translate, and hear voice output offline with Pakt. Built for travel conversations when internet access is unreliable.",
        "h1": "Offline voice and speech translator",
        "crumb": "Voice & Speech Translator",
        "eyebrow": "Voice translator",
        "lede": "Pakt helps travelers speak or type where supported, translate prepared languages offline, and hear results out loud in 49 voice output languages.",
        "min_words": 800,
        "hero_dialogue": (
            "Is this train going to the city center?",
            "Yes. The next stop is the city center.",
        ),
        "trust": [
            "Speak or type where supported",
            "Hear voice output in 49 languages",
            "Built for travel conversations",
            "Works offline after setup",
        ],
        "sections": [
            {
                "type": "steps",
                "kicker": "Flow",
                "title": "Speak, translate, hear.",
                "steps": [
                    ("Speak or type", "Enter a short phrase in the way that fits the moment and selected language support."),
                    ("Translate locally", "Use prepared languages offline after the required downloads are complete."),
                    ("Hear the result", "Play translated voice output in supported languages so the other person can listen."),
                ],
            },
            {
                "type": "copy_grid",
                "variant": "situation",
                "kicker": "Voice matters",
                "title": "Travel conversations often need sound, not only text.",
                "lede": "A voice translator is useful when pronunciation is the hard part.",
                "paragraphs": [
                    "Many travel phrases are simple but high pressure: asking a driver to stop at the right place, telling a hotel desk that the room key does not work, or explaining that food cannot contain a specific ingredient. Reading those phrases on a screen can help, but hearing them aloud can be faster and clearer.",
                    "Pakt is not positioned as a voice-only app. It is an offline travel translator with voice output as a major strength. That distinction matters because travelers still need text, preparation, and offline reliability, not only a microphone button.",
                    "Use clear, short phrases and check voice availability for the language before traveling. When voice output is supported, Pakt can help the translated phrase leave the screen and become part of a real conversation.",
                ],
                "cards": [
                    ("Driver instructions", "Let the translated destination or request be heard clearly."),
                    ("Service counters", "Ask concise questions when a line is moving quickly."),
                    ("Restaurants", "Play a translated dietary request instead of guessing pronunciation."),
                ],
            },
            {
                "type": "metrics",
                "kicker": "Offline voice output",
                "title": "Voice output is the competitive gap that matters for travel.",
                "lede": "Offline text is useful. Offline voice output makes the app more practical when the other person needs to hear the translation immediately.",
                "metrics": [
                    ("49", "languages with voice output"),
                    ("100", "languages for translation support"),
                    ("Ready", "prepared phone for offline translation"),
                ],
            },
            {
                "type": "features",
                "kicker": "Feature fit",
                "title": "What to expect from Pakt voice translation.",
                "cards": [
                    ("Offline-first preparation", "Download required languages before leaving so supported translation can work without a live connection."),
                    ("Voice output for spoken results", "Play supported translated phrases aloud when text alone is not the most natural handoff."),
                    ("Travel sentence style", "Short direct sentences work best for taxis, hotels, restaurants, pharmacies, and transit counters."),
                    ("Text backup", "If a place is loud, you can still show the translated phrase on screen."),
                    ("Private offline translation", "Prepared offline translation runs locally on your phone without requiring cloud translation."),
                    ("Broad language coverage", "Use 100-language translation support and check which of your languages have voice output."),
                ],
            },
            {
                "type": "languages",
                "kicker": "Voice language support",
                "title": "Check voice output before you travel.",
                "lede": "Pakt supports voice output in 49 languages. Availability can vary by language, so the best travel habit is to test the exact language pair and phrases before departure.",
                "languages": [
                    ("Japanese", "voice output when supported"),
                    ("Spanish", "voice output when supported"),
                    ("French", "voice output when supported"),
                    ("Italian", "voice output when supported"),
                    ("German", "voice output when supported"),
                    ("Portuguese", "voice output when supported"),
                ],
            },
            {
                "type": "copy",
                "band": True,
                "kicker": "Privacy",
                "title": "A voice translator for offline moments.",
                "paragraphs": [
                    "Travel voice translation can feel personal. You may be explaining a health need, a booking problem, or a route mistake. For prepared offline languages, Pakt translates locally on your phone and does not require cloud translation for that offline workflow.",
                    "Keep the claim practical: Pakt does not require cloud translation for prepared offline languages. It still depends on normal app distribution, downloads, and platform behavior outside that prepared translation moment.",
                ],
            },
            {
                "type": "scenarios",
                "kicker": "Use cases",
                "title": "Where voice output helps most.",
                "cards": [
                    ("Taxis", "Play a translated destination, pickup instruction, or route clarification."),
                    ("Hotels", "Explain check-in, room, key, luggage, or checkout questions."),
                    ("Restaurants", "Ask about ingredients, ordering, or the bill without guessing pronunciation."),
                    ("Stations", "Ask about platforms, transfers, tickets, or delays in short phrases."),
                    ("Pharmacies", "Describe a basic request and listen for the answer with text as backup."),
                    ("Markets", "Ask about price, size, and payment method with a phrase the seller can hear."),
                ],
            },
        ],
        "faqs": [
            ("Is Pakt a voice translator app?", "Yes. Pakt supports voice-oriented travel workflows, including voice output in 49 languages, while also supporting offline translation more broadly."),
            ("Can I hear translated speech offline?", "Pakt supports voice output in 49 languages. Download required languages before travel and test your language pair first."),
            ("Does Pakt only work by voice?", "No. Pakt is an offline travel translator. Voice output is important, but text remains useful as a backup."),
            ("Why is voice output useful for travel?", "It helps when the other person needs to hear the phrase, such as in a taxi, restaurant, hotel, pharmacy, or station."),
            ("Should I use long sentences?", "Short clear sentences work best. Ask one thing at a time and confirm important numbers or addresses separately."),
            ("Is offline voice translation private?", "For prepared offline languages, Pakt translates locally on your phone and does not require cloud translation."),
        ],
    },
    {
        "slug": "best-offline-translator-app",
        "title": "Best Offline Translator App for Travel - Pakt Comparison",
        "meta": "Compare offline translator apps by offline use, voice output, privacy, travel readiness, language support, and account requirements.",
        "h1": "Best offline translator app for travel",
        "crumb": "Best Offline Translator App",
        "eyebrow": "Comparison",
        "lede": "The best offline translator app is the one that is ready before you leave and still useful when connection is the weak part of the trip.",
        "min_words": 1200,
        "hero_dialogue": (
            "Can this work without mobile data?",
            "Yes, if the language is downloaded before the trip.",
        ),
        "trust": [
            "Fair comparison criteria",
            "Offline use varies by app",
            "Voice output matters",
            "Travel readiness first",
        ],
        "sections": [
            {
                "type": "copy",
                "kicker": "How to compare",
                "title": "Do not compare translator apps only on a perfect connection.",
                "paragraphs": [
                    "Most translator apps look good when WiFi is fast and the phrase is simple. Travel is a harsher test. The app may need to work after landing, in a taxi, inside a station, or while roaming is disabled. That is why the best offline translator app for travel should be judged by preparation, offline reliability, voice output, privacy posture, and coverage for common trip situations.",
                    "Offline capabilities vary by app. Some apps support downloaded language packs for selected use cases. Some features may still need a connection. Some apps are stronger at text, while others are stronger at speech or other specialized workflows. A fair comparison should avoid broad claims and focus on the exact travel job you need done.",
                    "Pakt is designed around offline travel translation after setup. It supports translation in 100 languages and voice output in 49 languages, with a focus on practical moments like taxis, hotels, restaurants, pharmacies, train stations, and airports.",
                ],
            },
            {
                "type": "features",
                "kicker": "Evaluation criteria",
                "title": "What makes an offline translator app worth relying on abroad.",
                "cards": [
                    ("Offline preparation", "Can you download what you need before the trip and verify it before leaving?"),
                    ("Voice output", "Can the app speak translated results aloud in the languages you need?"),
                    ("Travel scenarios", "Does the app support the short practical phrases travelers actually use?"),
                    ("Privacy posture", "Can prepared offline translation run locally on your phone?"),
                    ("Language coverage", "Does the app cover the destination language and your home language?"),
                    ("Low setup friction", "Can you open the app and translate quickly when a queue, driver, or desk agent is waiting?"),
                ],
            },
            {
                "type": "comparison",
                "kicker": "Comparison table",
                "title": "Pakt compared by travel readiness.",
                "lede": "This table avoids competitor overclaims. It compares the criteria a traveler should check before relying on any offline translator abroad.",
                "columns": ["Criteria", "Pakt", "Other offline translator apps", "Cloud-first translator apps"],
                "rows": [
                    ["Offline translation", "Built for prepared offline translation after required language downloads.", "Capabilities vary by app, language, and feature.", "Often strong online; offline support may be limited or require setup."],
                    ["Voice output", "Voice output in 49 languages, useful when a phrase should be heard.", "May support speech in selected languages or online modes.", "Often strong with connection; offline voice support should be checked."],
                    ["Travel focus", "Designed around taxis, hotels, restaurants, airports, stations, and pharmacies.", "May be general purpose rather than trip-preparation focused.", "Useful online, but less predictable when connection fails."],
                    ["Privacy model", "Prepared offline translation runs locally on the phone without requiring cloud translation.", "Depends on app architecture and feature selected.", "Typically relies on live service requests for core translation."],
                    ["Language coverage", "100 translation languages and 49 voice output languages.", "Coverage varies, especially for offline speech features.", "Broad online coverage is common; offline coverage should be verified."],
                    ["Account and setup", "Travel setup focuses on downloading languages before leaving.", "Setup varies by app and platform.", "May be easiest online, but less useful if the connection is unavailable."],
                ],
            },
            {
                "type": "copy_grid",
                "kicker": "Summary",
                "title": "The best choice depends on the failure mode you are preparing for.",
                "lede": "A translator app should match the moment you fear most on a trip.",
                "paragraphs": [
                    "If your main concern is perfect online translation at home, many apps can help. If your concern is landing in a new country with mobile data disabled, the comparison changes. The app needs downloaded languages, offline behavior that you have tested, and an interface that works under pressure.",
                    "Voice output also changes the comparison. A phrase on screen is useful, but spoken output can make a taxi, restaurant, or hotel conversation move faster. Pakt emphasizes this gap by supporting voice output in 49 languages.",
                    "The right test is practical: download the app, choose the language you need, turn off mobile data, and try the exact phrases you expect to use. If the app cannot handle those phrases before you leave, do not rely on it as your only travel translation plan.",
                ],
                "cards": [
                    ("Choose Pakt for", "Prepared offline travel translation with strong voice output coverage."),
                    ("Check any app for", "Language downloads, offline limits, voice support, and clear privacy details."),
                    ("Avoid relying on", "An untested translator app after you are already abroad."),
                ],
            },
            {
                "type": "metrics",
                "kicker": "Pakt strengths",
                "title": "Why Pakt belongs in the offline translator shortlist.",
                "lede": "Pakt is built for the travel-specific category rather than as a generic online translator page with offline mentioned in passing.",
                "metrics": [
                    ("100", "translation languages"),
                    ("49", "voice output languages"),
                    ("6", "core travel scenarios covered on this page"),
                ],
            },
            {
                "type": "checklist",
                "kicker": "Travel-readiness checklist",
                "title": "Use this checklist before choosing any offline translator app.",
                "items": [
                    "Confirm the destination language is supported.",
                    "Download required languages before the trip.",
                    "Turn on airplane mode and test real travel phrases.",
                    "Check whether voice output is available for the languages you need.",
                    "Read privacy language carefully and avoid assuming every feature is offline.",
                    "Keep a backup plan for medical, legal, emergency, or high-stakes conversations.",
                ],
            },
            {
                "type": "copy",
                "band": True,
                "kicker": "Fair comparison",
                "title": "Offline capabilities vary by app.",
                "paragraphs": [
                    "It would be misleading to say that all other translators stop without internet. Some competing apps offer useful offline modes, and some are excellent for specific tasks. The fair question is narrower: which app is prepared for your destination, your language pair, your voice needs, and your privacy expectations?",
                    "Pakt makes a clear travel promise: download the required languages before your trip and use prepared offline translation when WiFi, roaming, or mobile signal fails. That is the category it is trying to own.",
                ],
            },
            {
                "type": "copy",
                "kicker": "Buyer guide",
                "title": "How to decide what is best for your trip.",
                "paragraphs": [
                    "Start with the destination. A weekend in Spain, a rail trip through France, and a first visit to Japan create different translation needs. The language, script, public transportation system, and restaurant habits all shape what matters. Pakt is strongest when you prepare the languages for the trip and use it for practical conversations abroad.",
                    "Next, decide whether voice output matters. If you are comfortable showing text on screen, offline text may be enough for many moments. If pronunciation is unfamiliar or you expect fast spoken exchanges, voice output can save time. Pakt supports voice output in 49 languages, which is why it is a strong candidate for travelers who care about spoken phrases.",
                    "Then test privacy and offline behavior. The safe expectation is that app downloads, updates, stores, diagnostics, and support may involve online systems, while prepared offline translation can run locally on your phone. Look for clear language rather than broad slogans. For Pakt, the claim is that no cloud is required for offline translation after required languages are downloaded.",
                    "Finally, keep the app in the right role. Translation apps are useful travel tools, but they should not be the only plan for medical, legal, emergency, or safety-critical situations. For everyday travel friction, Pakt can make the ordinary conversations easier: where to go, what to order, what something costs, or how to explain a simple problem.",
                ],
            },
        ],
        "faqs": [
            ("What is the best offline translator app for travel?", "The best app is the one that supports your destination language, works after downloads, offers the voice features you need, and has been tested before departure."),
            ("Does Pakt work offline?", "Yes. Pakt works offline after required languages or models are downloaded to your phone."),
            ("How is Pakt different from online translators?", "Pakt is built around prepared offline travel translation and voice output for situations where WiFi or mobile signal may fail."),
            ("Do other translator apps have offline modes?", "Some do. Offline capabilities vary by app, language, and feature, so travelers should test the exact workflow before relying on it abroad."),
            ("Why does voice output matter?", "Voice output lets the other person hear a translated phrase, which can be faster in taxis, hotels, restaurants, pharmacies, and stations."),
            ("How many languages does Pakt support?", "Pakt supports translation in 100 languages and voice output in 49 languages."),
            ("Should I use an offline translator for emergencies?", "Use translation apps for everyday travel friction, but keep separate help plans for medical, legal, emergency, or safety-critical situations."),
            ("How should I test an offline translator app?", "Download the languages, turn on airplane mode, and try the taxi, hotel, restaurant, pharmacy, and station phrases you expect to use."),
        ],
    },
]


def related_pages(current_slug: str) -> list[dict[str, str]]:
    related = [
        {
            "slug": "offline-translator-app",
            "title": "Offline Translator App",
            "text": "Understand the core offline translation category and how Pakt fits travel use.",
        },
        {
            "slug": "offline-translator-for-travel",
            "title": "Offline Translator for Travel",
            "text": "Prepare Pakt before departure and use it abroad when connection fails.",
        },
        {
            "slug": "voice-speech-translator",
            "title": "Voice & Speech Translator",
            "text": "Use voice output for taxis, hotels, restaurants, stations, and more.",
        },
        {
            "slug": "best-offline-translator-app",
            "title": "Best Offline Translator App",
            "text": "Compare offline translator apps by travel readiness, privacy, and voice output.",
        },
    ]
    return [item for item in related if item["slug"] != current_slug]


SHOWCASE_PAGE = {
    "slug": "component-showcase",
    "title": "Pakt Component Showcase - Design Review",
    "meta": "Internal Pakt component showcase for reusable SEO landing blocks.",
    "robots": "noindex,nofollow",
    "h1": "Pakt component showcase.",
    "crumb": "Component Showcase",
    "eyebrow": "Component base",
    "lede": "A staging-ready review page for every reusable Pakt SEO landing block.",
    "hero_dialogue": (
        "Can you take me to this hotel?",
        "Claro. I can take you there now.",
    ),
    "sections": [
        {
            "type": "store_cta",
            "kicker": "Store CTA",
            "title": "Reusable download buttons.",
            "lede": "The same linked store CTAs render in hero, mid-page, and final download contexts.",
        },
        {
            "type": "phone_showcase",
            "kicker": "Phone mockup",
            "title": "Product UI, shown as a reusable visual.",
            "lede": "A standalone phone showcase can be reused inside product, flow, proof, and conversation blocks.",
        },
        PAGES[0]["sections"][0],
        PAGES[0]["sections"][1],
        PAGES[0]["sections"][2],
        PAGES[0]["sections"][3],
        PAGES[0]["sections"][4],
        PAGES[0]["sections"][5],
        PAGES[0]["sections"][6],
        PAGES[0]["sections"][7],
        PAGES[0]["sections"][8],
        PAGES[0]["sections"][9],
        {
            "type": "language_list",
            "kicker": "Full language list",
            "title": "Expanded language coverage.",
            "lede": "A panel treatment for broader language coverage without overloading the compact language grid.",
            "languages": EXPANDED_LANGUAGE_LIST,
        },
        PAGES[0]["sections"][10],
    ],
    "faqs": [
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Do I need to download languages before traveling?", "Yes. Download the languages you expect to use while WiFi is reliable, then test offline mode before leaving."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
    ],
}


DESIGN_PARITY_PAGE = {
    "slug": "component-parity",
    "title": "Pakt Component Parity - Internal Design Fixture",
    "meta": "Internal Pakt design-parity fixture for pixel testing reusable SEO landing blocks.",
    "robots": "noindex,nofollow",
    "h1": "Offline translation for real-world conversations.",
    "crumb": "Component Parity",
    "eyebrow": "Offline translator app",
    "lede": "Pakt works on your phone — no data, no roaming, no sign-in. Buy it once, use it everywhere.",
    "final_cta_body": "Get your offline translator ready before you leave",
    "hero_dialogue": (
        "Can you take me to this hotel?",
        "Claro. I can take you there now.",
    ),
    "sections": [
        {
            "type": "store_cta",
            "kicker": "Store CTA",
            "title": "Reusable download buttons.",
            "lede": "The same linked store CTAs render in hero, mid-page, and final download contexts.",
        },
        {
            "type": "phone_showcase",
            "kicker": "Phone mockup",
            "title": "Product UI, shown as a reusable visual.",
            "lede": "A standalone phone showcase can be reused inside product, flow, proof, and conversation blocks.",
        },
        {
            "type": "situation",
            "kicker": "The situation",
            "title": "You land. WiFi is weak. Roaming is $40 a day.",
            "lede": "And you still need to talk to taxi drivers, hotel staff, restaurants, pharmacies. Without internet, the others stop.",
            "highlight": "Pakt doesn't.",
        },
        {
            "type": "features",
            "kicker": "Features",
            "title": "Built for the road.",
            "lede": "",
            "cards": [
                ("Offline translation", "Models live on your phone. No internet needed once installed."),
                ("Voice input", "Just talk. Pakt hears and translates in real conversation."),
                ("Private by design", "Conversations never leave your phone. No servers, no logs, no accounts."),
                ("Travel ready", "Built for taxis, hotels, markets, pharmacies - the real road."),
                ("No cloud", "Translation runs locally. Nothing sent to a server."),
                ("Multi-language support", "Pick the pack for your trip, or unlock the world once."),
            ],
        },
        {
            "type": "steps",
            "kicker": "How it works",
            "title": "Set it up once. Use it anywhere.",
            "steps": [
                ("Download the app", "Free to try with 3 translations. Pick a pack when you're ready."),
                ("Choose your languages", "Download them while you have WiFi at home. Once. Forever yours."),
                ("Translate offline anywhere", "Airplane mode, basement, mountain, subway. It just works."),
            ],
        },
        {
            "type": "app_flow",
            "kicker": "How it works",
            "title": "Travel with confidence.",
            "flow_cards": [
                ("Speak", "Free to try with 3 translations. Pick a pack when you're ready."),
                ("Translate", "Free to try with 3 translations. Pick a pack when you're ready."),
                ("Hear", "Free to try with 3 translations. Pick a pack when you're ready."),
            ],
        },
        {
            "type": "scenarios",
            "kicker": "Scenarios",
            "title": "Wherever travel takes you.",
            "cards": [
                ("Taxis", "Quick conversations Quick conversations, quick conversations,..."),
                ("Hotels", "Quick conversations Quick conversations, quick conversations,..."),
                ("Restaurants", "Quick conversations Quick conversations, quick conversations,..."),
                ("Pharmacies", "Quick conversations Quick conversations, quick conversations,..."),
                ("Train stations", "Quick conversations Quick conversations, quick conversations,..."),
                ("Markets", "Quick conversations Quick conversations, quick conversations,..."),
            ],
        },
        PAGES[0]["sections"][5],
        PAGES[0]["sections"][6],
        PAGES[0]["sections"][7],
        {
            "type": "comparison",
            "kicker": "Comparison",
            "title": "How Pakt compares.",
            "lede": "",
            "columns": ["Feature", "Pakt", "Google Translate", "Apple Translate", "Others"],
            "rows": [
                ["Works offline", "✓", "Limited", "Limited", "-"],
                ["Voice translation", "✓", "Yes", "Yes", "Varies"],
                ["No cloud / private", "✓", "No", "No", "No"],
                ["Conversation mode", "✓", "Yes", "Yes", "Rare"],
                ["No account needed", "✓", "Yes", "Yes", "Often no"],
                ["One-time purchase", "✓", "Free / ads", "Free", "Subscription"],
            ],
        },
        PAGES[0]["sections"][9],
        {
            "type": "language_list",
            "kicker": "Full language list",
            "title": "Expanded language coverage.",
            "lede": "A panel treatment for broader language coverage without overloading the compact language grid.",
            "languages": EXPANDED_LANGUAGE_LIST,
        },
        PAGES[0]["sections"][10],
    ],
    "faqs": [
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Do I need to download languages before traveling?", "Yes. Download the languages you expect to use while WiFi is reliable, then test offline mode before leaving."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
        ("Does Pakt work without internet?", "Yes. Pakt works offline after the required languages or models are downloaded to your phone."),
    ],
}


def store_buttons() -> str:
    return f"""
      <div class="store-buttons" data-block="StoreCtaButtons">
        <a class="store-button apple" href="{e(APP_STORE_URL)}" target="_blank" rel="noopener" aria-label="Download Pakt on the App Store">
          <img class="store-icon" src="/images/pakt-store-apple.svg" alt="" width="18" height="22" loading="lazy" decoding="async">
          <span><small>Download on the</small>App Store</span>
        </a>
        <a class="store-button google" href="{e(PLAY_STORE_URL)}" target="_blank" rel="noopener" aria-label="Get Pakt on Google Play">
          <img class="store-icon" src="/images/pakt-store-google-play.svg" alt="" width="19" height="22" loading="lazy" decoding="async">
          <span><small>Get it on</small>Google Play</span>
        </a>
      </div>
    """


def render_json_ld(page: dict) -> str:
    url = page_url(page["slug"])
    graph = [
        {
            "@type": "Organization",
            "@id": f"{SITE}/#organization",
            "name": "Lingofonex",
            "url": f"{SITE}/",
            "logo": PAKT_FIGMA_LOGO_URL,
        },
        {
            "@type": "WebSite",
            "@id": f"{SITE}/#website",
            "url": f"{SITE}/",
            "name": "Lingofonex",
            "publisher": {"@id": f"{SITE}/#organization"},
            "inLanguage": "en",
        },
        {
            "@type": "MobileApplication",
            "@id": f"{SITE}/#app",
            "name": "Pakt",
            "alternateName": "Pakt by Lingofonex",
            "applicationCategory": "TravelApplication",
            "operatingSystem": "iOS, Android",
            "publisher": {"@id": f"{SITE}/#organization"},
            "url": f"{SITE}/pakt/",
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        },
        {
            "@type": "WebPage",
            "@id": f"{url}#webpage",
            "url": url,
            "name": page["title"],
            "description": page["meta"],
            "isPartOf": {"@id": f"{SITE}/#website"},
            "about": {"@id": f"{SITE}/#app"},
            "publisher": {"@id": f"{SITE}/#organization"},
            "breadcrumb": {"@id": f"{url}#breadcrumb"},
            "inLanguage": "en",
        },
        {
            "@type": "BreadcrumbList",
            "@id": f"{url}#breadcrumb",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/home/en.html"},
                {"@type": "ListItem", "position": 2, "name": "Pakt", "item": f"{SITE}/pakt/"},
                {"@type": "ListItem", "position": 3, "name": page["crumb"], "item": url},
            ],
        },
    ]
    if page.get("faqs"):
        graph.append(
            {
                "@type": "FAQPage",
                "@id": f"{url}#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": question,
                        "acceptedAnswer": {"@type": "Answer", "text": answer},
                    }
                    for question, answer in page["faqs"]
                ],
            }
        )
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)


def render_head(page: dict) -> str:
    url = page_url(page["slug"])
    title = page["title"]
    meta = page["meta"]
    robots = page.get("robots", "index,follow")
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{e(title)}</title>
  <meta name="description" content="{e(meta)}">
  <meta name="robots" content="{e(robots)}">
  <link rel="canonical" href="{e(url)}">
  <link rel="alternate" hreflang="en" href="{e(url)}">
  <link rel="alternate" hreflang="x-default" href="{e(url)}">
  <link rel="icon" type="image/png" href="/images/pakt-wordmark-white.png">
  <link rel="stylesheet" href="/css/pakt-stage2.css?v={ASSET_VERSION}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(meta)}">
  <meta property="og:image" content="{PAKT_FIGMA_SOCIAL_IMAGE_URL}">
  <meta property="og:url" content="{e(url)}">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Lingofonex">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(title)}">
  <meta name="twitter:description" content="{e(meta)}">
  <meta name="twitter:image" content="{PAKT_FIGMA_SOCIAL_IMAGE_URL}">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-40YHRYKQE3"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-40YHRYKQE3');</script>
  <script type="application/ld+json">
{render_json_ld(page)}
  </script>
</head>"""


def page_has_section(page: dict, section_id: str) -> bool:
    section_ids = {
        "features": "features",
        "steps": "how-it-works",
        "comparison": "comparison",
        "scenarios": "scenarios",
    }
    return any(section_ids.get(section.get("type")) == section_id for section in page.get("sections", []))


def render_nav(page: dict) -> str:
    feature_href = "#features" if page_has_section(page, "features") else "#scenarios"
    how_href = "#how-it-works" if page_has_section(page, "how-it-works") else "#comparison"
    links = [
        (feature_href, "Features", ""),
        (how_href, "How it works", ""),
        ("/privacy-policy/en.html", "Privacy", ""),
        ("#faq", "FAQ", ""),
    ]
    items = "\n".join(
        f'      <li><a href="{href}"{(" class=\"" + cls + "\"") if cls else ""}>{label}</a></li>'
        for href, label, cls in links
    )
    return f"""
<a class="skip-link" href="#content">Skip to content</a>
<nav class="site-nav" aria-label="Primary" data-block="HeaderNav">
  <div class="nav-inner">
    <a href="/pakt/" class="nav-brand">
      <img class="pakt-wordmark" src="/images/pakt-wordmark-white.png" alt="Pakt" width="139" height="39" decoding="async">
    </a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <ul class="nav-links">
{items}
      <li><a class="nav-cta" href="#download">Get app</a></li>
    </ul>
  </div>
</nav>"""


def render_hero(page: dict) -> str:
    heading = e(page["h1"]).replace("real-world", '<span class="nowrap">real-world</span>')
    return f"""
<header class="pakt-hero" data-block="HeroProduct">
  <div class="pakt-hero-inner">
    <div class="hero-copy">
      <h1>{heading}</h1>
      <p class="hero-lede">{e(page["lede"])}</p>
      <div class="hero-actions">
        {store_buttons()}
      </div>
    </div>
    <div class="hero-visual" data-block="PhoneMockupShowcase">
      <img class="hero-phone" src="/images/pakt-figma-phone-mockup.png" alt="Pakt app showing translated conversation cards on a phone" width="367" height="750" decoding="async">
    </div>
  </div>
</header>"""


def section_shell(
    content: str,
    band: bool = False,
    class_name: str = "section",
    block_name: str = "",
    section_id: str = "",
) -> str:
    block_attr = f' data-block="{e(block_name)}"' if block_name else ""
    id_attr = f' id="{e(section_id)}"' if section_id else ""
    if band:
        return f'<div class="section-band"><section{id_attr} class="{class_name}"{block_attr}>\n{content}\n</section></div>'
    return f'<section{id_attr} class="{class_name}"{block_attr}>\n{content}\n</section>'


def render_cards(cards: list[tuple[str, str]], class_name: str = "card-grid") -> str:
    return f'<div class="{class_name}">' + "\n".join(
        f"""
      <article class="card">
        <h3>{e(title)}</h3>
        <p>{e(text)}</p>
      </article>"""
        for title, text in cards
    ) + "\n    </div>"


def block_for_section(section: dict) -> tuple[str, str]:
    stype = section["type"]
    if stype == "situation":
        return ("SituationBlock", "situation")
    if stype == "features":
        return ("FeatureGrid", "features")
    if stype == "store_cta":
        return ("StoreCtaButtons", "store-cta")
    if stype == "phone_showcase":
        return ("PhoneMockupShowcase", "phone-showcase")
    if stype == "steps":
        return ("HowItWorksSteps", "how-it-works")
    if stype == "app_flow":
        return ("AppFlowSteps", "app-flow")
    if stype == "metrics":
        return ("OfflineProofBand", "offline-proof")
    if stype == "languages":
        return ("LanguageSupportGrid", "languages")
    if stype == "language_list":
        return ("FullLanguageListPanel", "language-list")
    if stype == "scenarios":
        return ("ScenarioCards", "scenarios")
    if stype == "checklist":
        return ("TravelChecklist", "checklist")
    if stype == "comparison":
        return ("ComparisonTable", "comparison")
    if stype == "copy_grid" and section.get("variant") == "situation":
        return ("SituationBlock", "situation")
    if stype == "privacy_conversation":
        return ("PrivacyBlock,ConversationBlock,DestinationModule", "privacy")
    if stype == "copy" and section.get("kicker", "").lower() == "privacy":
        return ("PrivacyBlock", "privacy")
    if stype == "copy":
        return ("LongFormSEOText", "guide")
    return ("", "")


def render_section(section: dict) -> str:
    kicker = f'<p class="section-kicker">{e(section["kicker"])}</p>' if section.get("kicker") else ""
    title = f'<h2 class="section-title">{e(section["title"])}</h2>' if section.get("title") else ""
    lede = f'<p class="section-lede">{e(section["lede"])}</p>' if section.get("lede") else ""
    band = bool(section.get("band"))
    stype = section["type"]
    block_name, section_id = block_for_section(section)

    if stype == "situation":
        content = f"""
  <div class="scroll-pin situation-pin">
    <div class="situation-slider" aria-label="Travel situation progression">
      <article class="situation-panel situation-panel-main" aria-current="true">
        {kicker}
        {title}
        {lede}
        <p class="situation-highlight">{e(section["highlight"])}</p>
      </article>
      <article class="situation-panel situation-panel-peek" aria-current="false">
        <p>Connection fails. The conversation still matters.</p>
      </article>
    </div>
  </div>"""
        return section_shell(content, band, "section situation-focus scroll-section", block_name, section_id)

    if stype == "copy_grid":
        paragraphs = "\n".join(f"          <p>{e(p)}</p>" for p in section["paragraphs"])
        if section.get("variant") == "situation":
            cards = '<div class="situation-deck">' + "\n".join(
                f"""
        <article class="situation-card">
          <h3>{e(title)}</h3>
          <p>{e(text)}</p>
        </article>"""
                for title, text in section["cards"]
            ) + "\n      </div>"
        else:
            cards = render_cards(section["cards"], "card-grid")
        content = f"""
  <div class="copy-grid">
    <div>
      {kicker}
      {title}
      {lede}
    </div>
    <div>
      <div class="body-copy">
{paragraphs}
      </div>
      {cards}
    </div>
  </div>"""
        class_name = "section situation-section" if section.get("variant") == "situation" else "section"
        return section_shell(content, band, class_name, block_name, section_id)

    if stype == "copy":
        paragraphs = "\n".join(f"      <p>{e(p)}</p>" for p in section["paragraphs"])
        content = f"""
  {kicker}
  {title}
  {lede}
  <div class="body-copy">
{paragraphs}
  </div>"""
        return section_shell(content, band, block_name=block_name, section_id=section_id)

    if stype == "store_cta":
        content = f"""
  <div class="store-cta-showcase">
    <div>
      {kicker}
      {title}
      {lede}
    </div>
    {store_buttons()}
  </div>"""
        return section_shell(content, band, "section store-cta-section", block_name, section_id)

    if stype == "phone_showcase":
        content = f"""
  {kicker}
  {title}
  {lede}
  <div class="phone-showcase-grid">
    <figure class="phone-showcase-main">
      <img class="hero-phone" src="/images/pakt-figma-phone-mockup.png" alt="Pakt app showing translated conversation cards on a phone" width="367" height="750" loading="lazy" decoding="async">
    </figure>
    <div class="phone-showcase-notes" aria-hidden="true">
      <div class="mini-screen blue">Type here...</div>
      <div class="mini-screen orange">Type here...</div>
    </div>
  </div>"""
        return section_shell(content, band, "section phone-showcase-section", block_name, section_id)

    if stype == "features":
        content = f"""
  {kicker}
  {title}
  {lede}
  {render_cards(section["cards"], "card-grid feature-grid")}"""
        return section_shell(content, band, block_name=block_name, section_id=section_id)

    if stype == "steps":
        steps = "\n".join(
            f"""
      <article class="step">
        <span class="step-number">{index:02d}</span>
        <h3>{e(title)}</h3>
        <p>{e(text)}</p>
      </article>"""
            for index, (title, text) in enumerate(section["steps"], 1)
        )
        content = f"""
  {kicker}
  <h2 class="section-title">{e(section["title"])}</h2>
  {lede}
  <div class="step-grid">
{steps}
  </div>"""
        return section_shell(content, band, block_name=block_name, section_id=section_id)

    if stype == "app_flow":
        cards = "\n".join(
            f"""
      <article class="flow-card" aria-selected="{'true' if index == 1 else 'false'}">
        <div>
          <h3>{e(title)}</h3>
          <p>{e(text)}</p>
        </div>
        <img class="flow-phone-image" src="/images/pakt-flow-phone-speak-tall.png" alt="" width="142" height="170" loading="lazy" decoding="async">
      </article>"""
            for index, (title, text) in enumerate(section["flow_cards"], 1)
        )
        content = f"""
  <div class="scroll-pin flow-pin">
    {kicker}
    {title}
    <div class="flow-grid" aria-label="{e(section['title'])}">
{cards}
    </div>
  </div>"""
        return section_shell(content, band, "section app-flow-section scroll-section", block_name, section_id)

    if stype == "metrics":
        if section.get("status_chips"):
            chips = "\n".join(
                f"""
      <li class="status-chip">
        <div class="status-chip-button" id="proof-tab-{index}" aria-selected="{'true' if index == 1 else 'false'}" data-proof-description="{e(proof_status_description(label))}">
          <span class="status-label">{e(label)}</span>
          <span class="status-icon" aria-hidden="true"></span>
        </div>
      </li>"""
                for index, label in enumerate(section["status_chips"], 1)
            )
            initial_status = proof_status_description(section["status_chips"][0])
            content = f"""
  <div class="scroll-pin proof-pin">
    {kicker}
    {title}
    {lede}
    <p id="proof-status-copy" class="proof-status-copy" aria-labelledby="proof-tab-1">{e(initial_status)}</p>
    <ul class="status-chip-list" aria-label="Offline connection conditions">
{chips}
    </ul>
    <img class="proof-device" src="/images/pakt-offline-proof-phone.png" srcset="/images/pakt-offline-proof-phone.png 390w, /images/pakt-offline-proof-phone-desktop.png 530w" sizes="(max-width: 760px) 390px, 530px" alt="" width="390" height="304" loading="lazy" decoding="async">
  </div>"""
            return section_shell(content, band, "section proof-section proof-band scroll-section", block_name, section_id)

        metrics = "\n".join(
            f"""
      <div class="metric">
        <strong>{e(value)}</strong>
        <span>{e(label)}</span>
      </div>"""
            for value, label in section["metrics"]
        )
        content = f"""
  {kicker}
  {title}
  {lede}
  <div class="metric-grid">
{metrics}
  </div>"""
        return section_shell(content, band, "section proof-section", block_name, section_id)

    if stype == "languages":
        stat_values = [("100+", "Languages"), ("49", "Voice languages")]
        language_title = f'<h2 class="section-title">{e(section.get("title", ""))}</h2>' if section.get("title") else ""
        stats = "\n".join(
            f"""
        <div class="language-stat">
          <strong>{e(number)}</strong>
          <span>{e(label)}</span>
        </div>"""
            for number, label in stat_values[:2]
        )
        languages = "\n".join(
            f'        <li><strong>{e(native_name)}</strong><span>{e(english_name)}</span></li>'
            for native_name, english_name in section.get("language_matrix", COMPACT_LANGUAGE_MATRIX)
        )
        mobile_languages = "\n".join(
            f'        <li><strong>{e(native_name)}</strong><span>{e(english_name)}</span></li>'
            for native_name, english_name in section.get("languages", COMMON_LANGUAGE_PILLS)
        )
        modal_languages = "\n".join(
            f'          <li><strong>{e(native_name)}</strong><span>{e(english_name)}</span></li>'
            for native_name, english_name in EXPANDED_LANGUAGE_MODAL
        )
        content = f"""
  <div class="languages-layout">
    <div class="languages-copy">
      {language_title}
      <p class="section-lede">Translate in <strong>100+</strong> languages.<br>Hear natural voice output in <strong>49</strong></p>
      <div class="language-stats">
{stats}
      </div>
      <ul class="language-mobile-cards" aria-label="Travel language examples">
{mobile_languages}
      </ul>
    </div>
    <div class="languages-panel-wrap">
      <ul class="language-grid" aria-label="Sample supported languages">
{languages}
      </ul>
      <button class="language-more" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="language-modal">+88 more languages</button>
    </div>
  </div>"""
        content += f"""
  <div class="language-modal" id="language-modal" role="dialog" aria-modal="true" aria-label="More supported languages" aria-hidden="true">
    <div class="language-modal-panel" tabindex="-1">
      <button class="language-modal-close" type="button" aria-label="Close language list"></button>
      <ul class="language-modal-grid" aria-label="More supported languages">
{modal_languages}
      </ul>
    </div>
  </div>"""
        return section_shell(content, band, block_name=block_name, section_id=section_id)

    if stype == "language_list":
        rows = "\n".join(
            f"""
      <li class="language-row">
        <span>{e(native_name)}</span>
        <strong>{e(english_name)}</strong>
      </li>"""
            for native_name, english_name in section["languages"]
        )
        content = f"""
  {kicker}
  {title}
  {lede}
  <div class="language-list-panel">
    <div class="language-list-search" aria-hidden="true">Search languages</div>
    <ul class="language-list-grid">
{rows}
    </ul>
  </div>"""
        return section_shell(content, band, block_name=block_name, section_id=section_id)

    if stype == "scenarios":
        cards = "\n".join(
            f"""
      <article class="scenario-card" data-scenario="{scenario_key(title)}">
        <h3>{e(title)}</h3>
        <p>{e(text)}</p>
      </article>"""
            for title, text in section["cards"]
        )
        content = f"""
  <div class="scroll-pin scenarios-pin">
    {kicker}
    {title}
    {lede}
    <div class="scenario-grid">
{cards}
    </div>
  </div>"""
        return section_shell(content, band, "section scroll-section", block_name=block_name, section_id=section_id)

    if stype == "checklist":
        items = []
        for index, item in enumerate(section["items"], 1):
            if isinstance(item, (tuple, list)):
                item_title, item_body = item
            else:
                item_title, item_body = item, ""
            body = f"<span>{e(item_body)}</span>" if item_body else ""
            items.append(
                f"""      <li class="check-item"><div class="check-toggle"><span class="check-control" aria-hidden="true"></span><span class="check-copy"><strong>{e(item_title)}</strong>{body}</span></div></li>"""
            )
        content = f"""
  <div class="scroll-pin checklist-pin">
    {kicker}
    {title}
    {lede}
    <ul class="checklist">
{chr(10).join(items)}
    </ul>
  </div>"""
        return section_shell(content, band, "section scroll-section", block_name=block_name, section_id=section_id)

    if stype == "privacy_conversation":
        privacy = section["privacy"]
        conversation = section["conversation"]
        destination = section.get("destination")
        destination_html = ""
        if destination:
            destination_html = f"""
    <section class="destination-mini" aria-labelledby="destination-mini-title">
      <p class="section-kicker">{e(destination["kicker"])}</p>
      <h2 id="destination-mini-title" class="section-title">{e(destination["title"])}</h2>
      <p class="section-lede">{e(destination["body"])}</p>
      <a class="destination-cta" href="#download">{e(destination["cta"])}</a>
      <img class="destination-image" src="{e(destination['image'])}" alt="{e(destination['alt'])}" width="960" height="404" loading="lazy" decoding="async">
    </section>"""
        content = f"""
  <div class="privacy-conversation-stack">
    <section class="privacy-mini" aria-labelledby="privacy-mini-title">
      <p class="section-kicker">{e(privacy["kicker"])}</p>
      <h2 id="privacy-mini-title" class="section-title">{e(privacy["title"])}</h2>
      <p class="section-lede">{e(privacy["body"])}</p>
      <div class="privacy-card">
        <span>{e(privacy["label"])}</span>
        <div class="lock-icon" aria-hidden="true"></div>
      </div>
    </section>
    <section class="conversation-mini" aria-labelledby="conversation-mini-title">
      <p class="section-kicker">{e(conversation["kicker"])}</p>
      <h2 id="conversation-mini-title" class="section-title">{e(conversation["title"])}</h2>
      <p class="section-lede">{e(conversation["body"])}</p>
      <div class="conversation-card" aria-hidden="true">
        <div class="bubble blue"><small>English</small>Type here...</div>
        <div class="mic-dot"> </div>
        <div class="bubble orange"><small>Russian</small>Type here...</div>
        <div class="mic-dot orange"> </div>
      </div>
    </section>
{destination_html}
  </div>"""
        return section_shell(content, band, "section privacy-conversation-section", block_name, section_id)

    if stype == "comparison":
        columns = section["columns"]
        head = "".join(f"<th>{e(col)}</th>" for col in columns)
        rows = []
        for row in section["rows"]:
            cells = []
            for label, value in zip(columns, row):
                cls = ' class="pakt-col"' if label == "Pakt" else ""
                cells.append(f'<td data-label="{e(label)}"{cls}>{e(value)}</td>')
            rows.append("<tr>" + "".join(cells) + "</tr>")
        content = f"""
  {kicker}
  {title}
  {lede}
  <div class="comparison-wrap">
    <table class="compare-table">
      <thead><tr>{head}</tr></thead>
      <tbody>
        {"".join(rows)}
      </tbody>
    </table>
  </div>"""
        return section_shell(content, band, block_name=block_name, section_id=section_id)

    raise ValueError(f"Unknown section type: {stype}")


def render_faq(page: dict) -> str:
    faq_items = "\n".join(
        f"""
    <details class="faq-item">
      <summary class="faq-question">{e(question)}</summary>
      <div class="faq-answer"><p>{e(answer)}</p></div>
    </details>"""
        for question, answer in page["faqs"]
    )
    return f"""
<section class="section" id="faq" data-block="FAQAccordion">
  <p class="section-kicker">FAQ</p>
  <h2 class="section-title">Frequently asked</h2>
  <div class="faq-list">
{faq_items}
  </div>
</section>"""


def render_related(page: dict) -> str:
    cards = "\n".join(
        f"""
    <a class="related-card" href="/pakt/{e(item["slug"])}/">
      <h3>{e(item["title"])}</h3>
      <p>{e(item["text"])}</p>
    </a>"""
        for item in related_pages(page["slug"])
    )
    return f"""
<section class="section" data-block="RelatedPagesGrid">
  <p class="section-kicker">Related pages</p>
  <h2 class="section-title">Keep planning offline translation.</h2>
  <div class="related-grid">
{cards}
    <a class="related-card" href="/pakt/">
      <h3>Pakt Product Hub</h3>
      <p>Return to the main Pakt overview and download path.</p>
    </a>
  </div>
</section>"""


def render_final_cta(page: dict) -> str:
    body = page.get("final_cta_body", page["meta"])
    return f"""
<section class="final-cta" id="download" data-block="FinalCTA">
  <span class="final-cta-close" aria-hidden="true"></span>
  <div class="final-cta-inner">
    <div class="final-cta-copy">
      <h2>Download Pakt<span class="final-heading-space"> </span><br class="final-heading-break">before your next trip</h2>
      <p>{e(body)}</p>
      {store_buttons()}
    </div>
    <div class="final-cta-visuals" aria-hidden="true">
      <div class="final-cta-phone-pane final-cta-phone-pane-front">
        <img src="/images/pakt-figma-phone-mockup.png" alt="">
      </div>
      <div class="final-cta-phone-pane final-cta-phone-pane-back">
        <img src="/images/pakt-figma-phone-mockup.png" alt="">
      </div>
    </div>
  </div>
</section>"""


def ordered_sections(page: dict) -> list[dict]:
    return page["sections"]


def render_footer() -> str:
    return """
<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <p class="footer-brand">Pakt is an offline translator app by Lingofonex, built for travel conversations when connection is unreliable.</p>
    </div>
    <div class="footer-links">
      <div class="footer-group">
        <h2>Pakt</h2>
        <a href="/pakt/">Product hub</a>
        <a href="/pakt/offline-translator-app/">Offline Translator App</a>
        <a href="/pakt/offline-translator-for-travel/">Offline Translator for Travel</a>
        <a href="/pakt/voice-speech-translator/">Voice Translator</a>
        <a href="/pakt/best-offline-translator-app/">Best Offline Translator App</a>
      </div>
      <div class="footer-group">
        <h2>Site</h2>
        <a href="/home/en.html">Home</a>
        <a href="/download/en.html">Download</a>
        <a href="/demo/en.html">Demo</a>
        <a href="/faq/en.html">FAQ</a>
      </div>
      <div class="footer-group">
        <h2>Legal</h2>
        <a href="/privacy-policy/en.html">Privacy Policy</a>
        <a href="/eula/en.html">EULA</a>
        <a href="/contact/en.html">Contact</a>
      </div>
    </div>
  </div>
</footer>"""


def render_page(page: dict) -> str:
    sections = "\n".join(render_section(section) for section in ordered_sections(page))
    body_class = f'page-{re.sub(r"[^a-z0-9]+", "-", page["slug"].lower()).strip("-")}'
    return f"""{render_head(page)}
<body class="{e(body_class)}">
{render_nav(page)}
{render_hero(page)}
<main id="content">
{sections}
{render_faq(page)}
{render_related(page)}
</main>
{render_final_cta(page)}
{render_footer()}
<script src="/js/nav.js?v={ASSET_VERSION}"></script>
</body>
</html>
"""


def write_pages() -> None:
    for page in PAGES:
        target = local_page_path(page["slug"])
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render_page(page), encoding="utf-8")
    showcase_target = local_page_path(SHOWCASE_PAGE["slug"])
    showcase_target.parent.mkdir(parents=True, exist_ok=True)
    showcase_target.write_text(render_page(SHOWCASE_PAGE), encoding="utf-8")
    parity_target = local_page_path(DESIGN_PARITY_PAGE["slug"])
    parity_target.parent.mkdir(parents=True, exist_ok=True)
    parity_target.write_text(render_page(DESIGN_PARITY_PAGE), encoding="utf-8")


def sitemap_block(page: dict) -> str:
    url = page_url(page["slug"])
    return f"""  <url>
    <loc>{url}</loc>
    <lastmod>{STAGE2_LASTMOD}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="{url}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{url}"/>
  </url>"""


def update_sitemap() -> None:
    path = ROOT / "sitemap.xml"
    text = path.read_text(encoding="utf-8")
    for page in PAGES:
        url = re.escape(page_url(page["slug"]))
        text = re.sub(rf"\s*<url>\s*<loc>{url}</loc>.*?</url>", "", text, flags=re.DOTALL)
    blocks = "\n".join(sitemap_block(page) for page in PAGES)
    text = text.replace("\n</urlset>", f"\n{blocks}\n</urlset>")
    path.write_text(text, encoding="utf-8")


def update_llms() -> None:
    stage_links = "\n".join(
        f'- [{page["crumb"]}]({page_url(page["slug"])}) - {page["meta"]}' for page in PAGES
    )
    text = f"""# Pakt - Offline Translator App for Travel

> Pakt is an offline translator app for travelers, built by Lingofonex. It supports translation in 100 languages and voice output in 49 languages after the required languages or models are downloaded.

Publisher: Lingofonex ({SITE})
App brand: Pakt (alternate name: "Pakt by Lingofonex")
Primary use case: offline text and voice-oriented translation for travel
Languages supported: 100
Voice output: 49 languages
Privacy posture: Pakt translates locally on your phone for prepared offline languages. No cloud required for offline translation.

## Pakt Pages

- [Pakt - product hub]({SITE}/pakt/) - Pakt product hub: offline translator for travel by Lingofonex; supports translation in 100 languages and voice output in 49.
{stage_links}

## Site Pages

- [Home]({SITE}/home/en.html) - Product overview and app information
- [Demo]({SITE}/demo/en.html) - Live translation examples and screenshots
- [Download]({SITE}/download/en.html) - iOS App Store and Google Play download links
- [FAQ]({SITE}/faq/en.html) - Common questions about offline use, accuracy, and languages
- [Privacy Policy]({SITE}/privacy-policy/en.html) - Data handling and privacy details
- [EULA]({SITE}/eula/en.html) - End-user license agreement
- [Contact]({SITE}/contact/en.html) - Support and feedback

## Localization

Legacy site sections are available in 23 languages. The Pakt Stage 2 SEO pages are English pages only until localized versions are created.

## Claim Notes

- Pakt is an app/product by Lingofonex. Lingofonex is the publisher.
- Pakt works offline after required languages or models are downloaded.
- Pakt supports translation in 100 languages and voice output in 49 languages.
- Pakt is built for travel situations such as taxis, hotels, restaurants, airports, pharmacies, and train stations.
- Avoid assuming high-stakes medical, legal, or emergency reliability. Use clear, practical travel phrases and verify important details.
"""
    (ROOT / "llms.txt").write_text(text, encoding="utf-8")


def update_hub() -> None:
    path = ROOT / "pakt" / "index.html"
    text = path.read_text(encoding="utf-8")
    text = re.sub(
        r"Speak, type, or scan\s+text\s+.\s+Pakt translates on-device when connection fails\.",
        "Speak or type where supported - Pakt translates on-device after required languages are downloaded.",
        text,
    )
    if "Explore Pakt offline translation guides" not in text:
        cards = "\n".join(
            f"""    <div class="feature-card">
      <h3><a href="/pakt/{e(page["slug"])}/">{e(page["crumb"])}</a></h3>
      <p>{e(page["meta"])}</p>
    </div>"""
            for page in PAGES
        )
        explore = f"""
  <section class="body-text" id="pakt-stage2-guides">
    <h2 class="section-title">Explore Pakt offline translation guides</h2>
    <p>Use these travel-focused pages to compare offline translator app features, prepare before a trip, and understand how voice output helps when connection is unreliable.</p>
  </section>

  <div class="features">
{cards}
  </div>
"""
        text = text.replace("  <section class=\"final-cta\">", explore + "\n  <section class=\"final-cta\">")
    footer_marker = '    <a href="/pakt/">Pakt</a>'
    footer_links = """    <a href="/pakt/">Pakt</a>
    <a href="/pakt/offline-translator-app/">Offline Translator App</a>
    <a href="/pakt/offline-translator-for-travel/">Offline Translator for Travel</a>
    <a href="/pakt/voice-speech-translator/">Voice Translator</a>
    <a href="/pakt/best-offline-translator-app/">Best Offline Translator App</a>"""
    footer_text = text.split("<footer", 1)[1] if "<footer" in text else ""
    if "/pakt/offline-translator-app/" not in footer_text:
        text = text.replace(footer_marker, footer_links)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    write_pages()
    update_sitemap()
    update_llms()
    update_hub()
    print("Generated Stage 2A Pakt pages:")
    for page in PAGES:
        print(f"- /pakt/{page['slug']}/")
    print(f"- /pakt/{SHOWCASE_PAGE['slug']}/")
    print(f"- /pakt/{DESIGN_PARITY_PAGE['slug']}/")


if __name__ == "__main__":
    main()
