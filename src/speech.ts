import { state } from './state';
import { els } from './elements';
import { updateMicUI, updateHighlight, scrollToCurrent, advancePastSkipped, restartScript, navigateParagraphs } from './render';

// Track the last matched word to prevent matching the same word twice in a row
let lastMatchedWord = '';

type MatchCandidate = {
    targetIndex: number;
    advanceWords: number;
    matchCount: number;
    strongCount: number;
    signature: string;
};

const MAX_SEQUENCE_MATCH = 3;
const MAX_EFFECTIVE_LOOKAHEAD = 3;
const SPOKEN_CONTEXT_WORDS = 6;
const WEAK_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'de', 'del', 'des',
    'do', 'does', 'did', 'el', 'en', 'era', 'es', 'et', 'for', 'from', 'go', 'in', 'is',
    'it', 'la', 'las', 'le', 'les', 'lo', 'los', 'me', 'mi', 'of', 'on', 'or', 'para',
    'por', 'que', 'se', 'son', 'su', 'te', 'the', 'to', 'tu', 'un', 'una', 'unas', 'une',
    'uno', 'unos', 'was', 'were', 'with', 'y'
]);
let pendingMatch: { signature: string; hits: number } | null = null;

// Track which result indices we already processed for commands
// to prevent re-firing when the recognition engine revisits finalized results

let speechBlocked = false;

// Voice command arming to prevent duplicate triggers
let commandArmed = true;

// Arc / silent-fail detection
let isFirstStart = true;
let gotResultOnFirstStart = false;

function showBrowserWarning() {
    els.browserWarning.classList.remove('hidden');
}

function normalizeToken(token: string): string {
    return token.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
}

function extractNormalizedTokens(text: string): string[] {
    return text
        .split(/\s+/)
        .map(normalizeToken)
        .filter(token => token.length > 0);
}

function isWeakToken(token: string): boolean {
    return token.length <= 2 || WEAK_WORDS.has(token);
}

function clearPendingMatch(): void {
    pendingMatch = null;
}

function getSequenceMatch(spokenTokens: string[], scriptTokens: string[]): { matchCount: number; strongCount: number } | null {
    const maxMatch = Math.min(MAX_SEQUENCE_MATCH, spokenTokens.length, scriptTokens.length);
    if (maxMatch === 0) return null;

    let best: { matchCount: number; strongCount: number } | null = null;
    for (const tailOffset of [0, 1]) {
        const availableSpoken = spokenTokens.length - tailOffset;
        if (availableSpoken <= 0) continue;

        const limit = Math.min(maxMatch, availableSpoken);
        for (let size = limit; size >= 1; size--) {
            const spokenSlice = spokenTokens.slice(availableSpoken - size, availableSpoken);
            const scriptSlice = scriptTokens.slice(0, size);

            let matches = true;
            for (let i = 0; i < size; i++) {
                if (spokenSlice[i] !== scriptSlice[i]) {
                    matches = false;
                    break;
                }
            }

            if (!matches) continue;

            const strongCount = scriptSlice.filter(token => !isWeakToken(token)).length;
            const candidate = { matchCount: size, strongCount };
            if (
                !best ||
                candidate.matchCount > best.matchCount ||
                (candidate.matchCount === best.matchCount && candidate.strongCount > best.strongCount)
            ) {
                best = candidate;
            }
        }
    }

    return best;
}

function collectScriptTokens(startIndex: number): { tokens: string[]; lastIndex: number } {
    const tokens: string[] = [];
    let lastIndex = startIndex;

    for (let i = startIndex; i < state.scriptWords.length && tokens.length < MAX_SEQUENCE_MATCH; i++) {
        const scriptWord = state.scriptWords[i];
        if (scriptWord.skip || !scriptWord.clean) continue;
        tokens.push(scriptWord.clean);
        lastIndex = i;
    }

    return { tokens, lastIndex };
}

function findBestMatchCandidate(spokenTokens: string[]): MatchCandidate | null {
    const effectiveLookahead = Math.min(state.config.lookaheadWords, MAX_EFFECTIVE_LOOKAHEAD);
    let candidate: MatchCandidate | null = null;
    let scriptPtr = state.currentIndex;
    let validWordsChecked = 0;

    while (scriptPtr < state.scriptWords.length && validWordsChecked < effectiveLookahead) {
        const scriptWord = state.scriptWords[scriptPtr];
        if (scriptWord.skip || !scriptWord.clean) {
            scriptPtr++;
            continue;
        }

        const { tokens, lastIndex } = collectScriptTokens(scriptPtr);
        const sequenceMatch = getSequenceMatch(spokenTokens, tokens);

        if (sequenceMatch) {
            const nextCandidate: MatchCandidate = {
                targetIndex: lastIndex,
                advanceWords: validWordsChecked + 1,
                matchCount: sequenceMatch.matchCount,
                strongCount: sequenceMatch.strongCount,
                signature: `${lastIndex}:${sequenceMatch.matchCount}`
            };

            if (
                !candidate ||
                nextCandidate.matchCount > candidate.matchCount ||
                (nextCandidate.matchCount === candidate.matchCount && nextCandidate.strongCount > candidate.strongCount) ||
                (
                    nextCandidate.matchCount === candidate.matchCount &&
                    nextCandidate.strongCount === candidate.strongCount &&
                    nextCandidate.advanceWords < candidate.advanceWords
                )
            ) {
                candidate = nextCandidate;
            }
        }

        scriptPtr++;
        validWordsChecked++;
    }

    return candidate;
}

function shouldApplyImmediately(candidate: MatchCandidate, hasFinalResult: boolean): boolean {
    if (candidate.matchCount >= 3 && candidate.strongCount >= 2) {
        return true;
    }

    if (candidate.advanceWords === 1) {
        if (candidate.matchCount >= 2 && candidate.strongCount >= 1) {
            return true;
        }
        return hasFinalResult && candidate.strongCount >= 1;
    }

    return hasFinalResult && candidate.matchCount >= 2 && candidate.strongCount >= 1;
}

function applyMatch(candidate: MatchCandidate): void {
    clearPendingMatch();
    lastMatchedWord = state.scriptWords[candidate.targetIndex]?.clean ?? '';
    state.currentIndex = candidate.targetIndex + 1;
    advancePastSkipped();
    updateHighlight();
    scrollToCurrent();
}

export function initSpeech(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        // No API at all — Firefox, older browsers
        showBrowserWarning();
        return;
    }

    state.recognition = new SpeechRecognition();
    state.recognition.continuous = true;
    state.recognition.interimResults = true;
    state.recognition.lang = state.selectedLanguage;

    state.recognition.onresult = (event: any) => {
        // Mark that we got real results on first start (rules out Arc silent fail)
        if (isFirstStart) {
            gotResultOnFirstStart = true;
        }

        let transcript = '';
        let hasFinalResult = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
            hasFinalResult = hasFinalResult || Boolean(event.results[i].isFinal);
        }

        // --- Voice Commands (Mac-Style) ---
        if (state.config.voiceCommandsEnabled) {
            const cleanTokens = transcript.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(t => t.length > 0);
            if (cleanTokens.length >= 2) {
                const lastTwoWords = cleanTokens.slice(-2).join(' ');
                let commandMatched: string | null = null;
                
                if (lastTwoWords === 'go start') commandMatched = 'go start';
                else if (lastTwoWords === 'go finish') commandMatched = 'go finish';
                else if (lastTwoWords === 'go next') commandMatched = 'go next';
                else if (lastTwoWords === 'go back') commandMatched = 'go back';
                
                if (commandMatched) {
                    const commandTokens = commandMatched.split(' ');
                    // Conflict resolution: look around the current index (back 4, forward 10)
                    const startIdx = Math.max(0, state.currentIndex - 4);
                    const endIdx = Math.min(state.scriptWords.length, state.currentIndex + 10);
                    const windowScript = state.scriptWords.slice(startIdx, endIdx).map(w => w.word.toLowerCase().replace(/[^\w\s]/g, ''));
                    
                    let conflict = false;
                    for (let j = 0; j < Math.max(0, windowScript.length - 1); j++) {
                        if (windowScript[j] === commandTokens[0] && windowScript[j+1] === commandTokens[1]) {
                            conflict = true;
                            break;
                        }
                    }
                    
                    if (!conflict) {
                        if (commandArmed) {
                            commandArmed = false;
                            console.log(`[VoiceCommand] TRIGGER: ${commandMatched}`);
                            if (commandMatched === 'go start') {
                                restartScript();
                            } else if (commandMatched === 'go finish') {
                                state.currentIndex = Math.max(0, state.scriptWords.length - 1);
                                updateHighlight();
                                scrollToCurrent();
                            } else if (commandMatched === 'go next') {
                                navigateParagraphs('forward', 1);
                            } else if (commandMatched === 'go back') {
                                navigateParagraphs('back', 1);
                            }
                            lastMatchedWord = '';
                            clearPendingMatch();
                            return; // Stop processing to prevent the command from being read as script text
                        }
                    } else {
                        commandArmed = true;
                    }
                } else {
                    commandArmed = true;
                }
            } else {
                commandArmed = true;
            }
        }

        // Use a short ordered token window instead of a bag-of-words match.
        // That makes repeated/common words much less likely to jump ahead.
        const spokenWords = extractNormalizedTokens(transcript).slice(-SPOKEN_CONTEXT_WORDS);
        matchWords(spokenWords, hasFinalResult);
    };

    state.recognition.onerror = (e: any) => {
        console.log('error:', e.error, e.message);

        // Arc / silent-fail detection: error fires immediately on first start with no results
        if (isFirstStart && !gotResultOnFirstStart) {
            isFirstStart = false;
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture' || e.error === 'aborted') {
                // These are legitimate errors that don't mean the browser lacks support
                // 'aborted' happens on Safari iOS when the permission dialog interrupts the first recognition start
            } else {
                showBrowserWarning();
            }
            state.isListening = false;
            updateMicUI(false);
            return;
        }

        if (e.error === 'aborted') {
            speechBlocked = true;

            // Modern iPad detection
            const isIPad = navigator.userAgent.includes('iPad') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 2);
            const isPWA = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;

            if (isIPad && isPWA) {
                els.ipadPwaWarning.classList.remove('hidden');
            }

            state.isListening = false;
            updateMicUI(false);
            return;
        }
    };

    state.recognition.onend = () => {
        console.log('ended');

        // Arc / silent-fail detection: ended immediately on first start with no results and no error
        if (isFirstStart && !gotResultOnFirstStart) {
            isFirstStart = false;
            showBrowserWarning();
            state.isListening = false;
            updateMicUI(false);
            return;
        }
        isFirstStart = false;

        if (speechBlocked) return;
        if (state.isListening) {

            try {
                state.recognition.start();
            } catch (error) {
                console.error('Failed to restart speech recognition:', error);
            }
        } else {
            updateMicUI(false);
        }
    };
}

export function startListening(): void {
    if (!state.recognition) return;
    state.isListening = true;
    lastMatchedWord = '';
    clearPendingMatch();

    speechBlocked = false;
    try {
        state.recognition.start();
        updateMicUI(true);
    } catch (error) {
        console.error('Failed to start speech recognition:', error);
        state.isListening = false;
        updateMicUI(false);
    }
}

export function stopListening(): void {
    if (!state.recognition) return;
    state.isListening = false;
    lastMatchedWord = '';
    clearPendingMatch();

    try {
        state.recognition.stop();
        updateMicUI(false);
    } catch (error) {
        console.error('Failed to stop speech recognition:', error);
    }
}

function matchWords(spokenWords: string[], hasFinalResult: boolean) {
    if (state.currentIndex >= state.scriptWords.length) return;
    if (spokenWords.length === 0) return;
    const candidate = findBestMatchCandidate(spokenWords);
    if (!candidate) {
        clearPendingMatch();
        return;
    }

    if (candidate.matchCount === 1 && candidate.strongCount === 0 && candidate.advanceWords > 1) {
        clearPendingMatch();
        return;
    }

    if (candidate.matchCount === 1 && state.scriptWords[candidate.targetIndex]?.clean === lastMatchedWord && !hasFinalResult) {
        clearPendingMatch();
        return;
    }

    if (shouldApplyImmediately(candidate, hasFinalResult)) {
        applyMatch(candidate);
        return;
    }

    if (pendingMatch?.signature === candidate.signature) {
        pendingMatch.hits += 1;
    } else {
        pendingMatch = { signature: candidate.signature, hits: 1 };
    }

    if (pendingMatch.hits >= 2) {
        applyMatch(candidate);
    }
}
