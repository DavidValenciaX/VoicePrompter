import { els } from './elements';
import { state } from './state';
import { HistoryItem } from './types';

function getWordElements(wordObj: typeof state.scriptWords[number]): HTMLElement[] {
    return [wordObj.element, wordObj.floatingElement].filter(Boolean) as HTMLElement[];
}

function renderScriptIntoContainer(
    container: HTMLElement,
    targetKey: 'element' | 'floatingElement',
    idPrefix: string
): void {
    container.innerHTML = '';

    state.scriptWords.forEach((obj, index) => {
        const span = document.createElement('span');
        span.textContent = obj.word;
        span.id = `${idPrefix}-${index}`;

        let classList = 'script-word transition-opacity duration-300 ';

        if (obj.isStop) {
            classList += 'stop-marker ';
        } else if (obj.isBreak) {
            classList += 'line-break ';
            span.style.display = 'block';
            span.style.width = '100%';
        } else if (obj.skip) {
            classList += 'skipped-word ';
        } else {
            classList += 'text-future ';
        }
        span.className = classList;

        span.onclick = () => {
            if (!obj.skip) {
                state.currentIndex = index;
                updateHighlight();
                scrollToCurrent();
            }
        };

        container.appendChild(span);
        obj[targetKey] = span;
    });
}

function applyStopMarkerVisibility(): void {
    [els.scriptContent, els.floatingScriptContent].forEach((container) => {
        container.classList.toggle('show-stops', state.config.showStopIcon);
    });
}

function getFontStack(): string {
    const fontMap: Record<string, string> = {
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif',
        serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        comicSans: '"Comic Sans MS", "Chalkboard SE", "Trebuchet MS", cursive',
        openDyslexic: '"OpenDyslexic", cursive'
    };

    return fontMap[state.config.fontFamily] ?? fontMap.mono;
}

function syncScriptViewportSpacing(): void {
    const positionRatio = state.config.activeLinePosition / 100;
    const syncSpacing = (
        scrollContainer: HTMLElement,
        topSpacer: HTMLElement,
        scriptContent: HTMLElement
    ) => {
        const containerHeight = scrollContainer.clientHeight;
        if (!containerHeight) return;

        topSpacer.style.height = `${Math.round(containerHeight * positionRatio)}px`;
        scriptContent.style.paddingBottom = `${Math.round(containerHeight * (1 - positionRatio) + 48)}px`;
    };

    syncSpacing(els.scrollContainer, els.topSpacer, els.scriptContent);
    syncSpacing(els.floatingScrollContainer, els.floatingTopSpacer, els.floatingScriptContent);
}

export function setControlDocksOpacity(opacity: number | null): void {
    const value = opacity === null ? '' : opacity.toString();
    [els.mainControlsDock, els.floatingControlsDock].forEach((dock) => {
        dock.style.opacity = value;
    });
}

export function updateFloatingWindowVisibility(): void {
    const isPrompterVisible = !els.prompterContainer.classList.contains('hidden');
    const enabled = state.config.floatingWindowEnabled && isPrompterVisible;

    els.floatingWindowToggle.checked = state.config.floatingWindowEnabled;
    els.floatingPrompterWindow.classList.toggle('hidden', !enabled);

    const hideMainScript = enabled && !state.isVideoMode;
    els.scrollWrapper.style.visibility = hideMainScript ? 'hidden' : '';
    els.scrollWrapper.style.pointerEvents = hideMainScript ? 'none' : '';

    els.mainControlsDock.style.visibility = enabled ? 'hidden' : '';
    els.mainControlsDock.style.pointerEvents = enabled ? 'none' : '';

    setControlDocksOpacity(state.isListening || state.isRecording ? state.config.dockOpacity / 100 : null);
    syncScriptViewportSpacing();
}

export function renderScript(): void {
    state.scriptWords.forEach((obj) => {
        obj.element = null;
        obj.floatingElement = null;
    });

    renderScriptIntoContainer(els.scriptContent, 'element', 'word');
    renderScriptIntoContainer(els.floatingScriptContent, 'floatingElement', 'floating-word');
    applyStopMarkerVisibility();

    els.setupScreen.classList.add('hidden');
    els.prompterContainer.classList.remove('hidden');

    // Toggle Google Docs Sync panel
    if (state.googleDocUrl) {
        els.refreshGoogleDocContainer.classList.remove('hidden');
    } else {
        els.refreshGoogleDocContainer.classList.add('hidden');
    }

    state.currentIndex = 0;
    advancePastSkipped();
    updateHighlight();
    updateFloatingWindowVisibility();
    syncScriptViewportSpacing();
    
    setTimeout(() => {
        scrollToCurrent();
    }, 50);
}

export function updateHighlight(): void {
    state.scriptWords.forEach((obj, idx) => {
        if (obj.skip) return;

        if (idx < state.currentIndex) {
            getWordElements(obj).forEach((el) => {
                el.classList.remove('current-word', 'text-future');
                el.classList.add('text-neutral-500');
            });
        } else if (idx === state.currentIndex) {
            getWordElements(obj).forEach((el) => {
                el.classList.remove('text-neutral-500', 'text-future');
                el.classList.add('current-word');
            });
        } else {
            getWordElements(obj).forEach((el) => {
                el.classList.remove('current-word', 'text-neutral-500');
                el.classList.add('text-future');
            });
        }
    });
}

export function scrollToCurrent(): void {
    if (state.currentIndex < state.scriptWords.length) {
        const currentWordObj = state.scriptWords[state.currentIndex];
        if (!currentWordObj) return;

        syncScriptViewportSpacing();

        const positionRatio = state.config.activeLinePosition / 100;
        const scrollTargets: Array<[HTMLElement, HTMLElement | null]> = [
            [els.scrollContainer, currentWordObj.element],
            [els.floatingScrollContainer, currentWordObj.floatingElement]
        ];

        scrollTargets.forEach(([container, targetEl]) => {
            if (!targetEl || container.clientHeight === 0) return;

            const containerHeight = container.clientHeight;
            const targetPosition = targetEl.offsetTop - (containerHeight * positionRatio);

            if (state.config.smoothAnimations) {
                smoothScrollTo(container, targetPosition, 600);
            } else {
                container.scrollTo({
                    top: targetPosition,
                    behavior: 'auto'
                });
            }
        });
    }
}

function smoothScrollTo(element: HTMLElement, target: number, duration: number): void {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();

    function animateScroll(currentTime: number) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // EaseInOutQuad
        const ease = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        element.scrollTop = start + change * ease;

        if (timeElapsed < duration) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

export function advancePastSkipped(): void {
    while (state.currentIndex < state.scriptWords.length && state.scriptWords[state.currentIndex].skip) {
        state.currentIndex++;
    }
}

export function restartScript(): void {
    state.currentIndex = 0;
    advancePastSkipped();
    updateHighlight();
    scrollToCurrent();
}

export function navigateParagraphs(direction: 'back' | 'forward', paragraphCount: number): void {
    if (state.scriptWords.length === 0) return;

    // Find all paragraph boundary indices (words representing line breaks/stops)
    // Merge consecutive breaks into a single boundary
    const paragraphEnds: number[] = [];
    let lastWasBreak = false;
    state.scriptWords.forEach((w, i) => {
        if (w.isStop || w.isBreak) {
            if (!lastWasBreak) {
                paragraphEnds.push(i);
                lastWasBreak = true;
            } else {
                // Update to the last break in the sequence
                paragraphEnds[paragraphEnds.length - 1] = i;
            }
        } else if (!w.skip) {
            lastWasBreak = false;
        }
    });

    // If there are no explicit paragraph breaks, fallback to sentence boundaries
    if (paragraphEnds.length === 0) {
        state.scriptWords.forEach((w, i) => {
            if (!w.skip && /[.!?]$/.test(w.word)) {
                paragraphEnds.push(i);
            }
        });
    }

    if (direction === 'back') {
        // Find how many paragraph boundaries are before currentIndex
        let target = 0;
        let boundariesBefore = 0;
        for (let i = paragraphEnds.length - 1; i >= 0; i--) {
            if (paragraphEnds[i] < state.currentIndex) {
                boundariesBefore++;
                if (boundariesBefore >= paragraphCount) {
                    // Go to the word AFTER the previous paragraph end (start of that paragraph)
                    target = i > 0 ? paragraphEnds[i - 1] + 1 : 0;
                    break;
                }
            }
        }
        if (boundariesBefore < paragraphCount) {
            target = 0; // Go to the very beginning
        }
        state.currentIndex = target;
    } else {
        // Forward: skip ahead by paragraphCount paragraph endings
        let boundariesAfter = 0;
        let target = state.scriptWords.length - 1;
        for (let i = 0; i < paragraphEnds.length; i++) {
            if (paragraphEnds[i] >= state.currentIndex) {
                boundariesAfter++;
                if (boundariesAfter >= paragraphCount) {
                    target = paragraphEnds[i] + 1;
                    break;
                }
            }
        }
        state.currentIndex = Math.min(target, state.scriptWords.length - 1);
    }

    advancePastSkipped();
    updateHighlight();
    scrollToCurrent();
}

export function applySettings(): void {
    els.appBody.style.backgroundColor = state.config.bgColor;
    els.appBody.style.color = state.config.textColor;
    els.appBody.style.setProperty('--base-color', state.config.textColor);
    els.floatingPrompterWindow.ownerDocument.documentElement.style.setProperty('--base-color', state.config.textColor);
    els.floatingPrompterWindow.ownerDocument.body.style.backgroundColor = state.config.bgColor;
    els.floatingPrompterWindow.ownerDocument.body.style.color = state.config.textColor;

    els.prompterContainer.style.backgroundColor = state.config.bgColor;
    els.floatingPrompterWindow.style.backgroundColor = state.config.bgColor;
    els.floatingPrompterWindow.style.color = state.config.textColor;

    if (!(state.isVideoMode && state.videoLayoutMode === 'overlay')) {
        els.scrollContainer.style.backgroundColor = state.config.bgColor;
    }
    els.floatingScrollContainer.style.backgroundColor = state.config.bgColor;
    els.floatingScrollContainer.style.color = state.config.textColor;

    const fontStack = getFontStack();
    [els.scriptContent, els.floatingScriptContent].forEach((container) => {
        container.style.setProperty('--paragraph-spacing', `${state.config.paragraphSpacing}em`);
        container.style.lineHeight = `${state.config.lineHeight}`;
        container.style.textAlign = state.config.textAlign;
        container.style.direction = state.config.textDirection;
        container.style.fontFamily = fontStack;
        container.style.fontSize = `${state.config.fontSize}px`;
        container.style.paddingLeft = `${state.config.margin}%`;
        container.style.paddingRight = `${state.config.margin}%`;
        container.classList.toggle('smooth-animations', state.config.smoothAnimations);
        container.classList.toggle('highlight-active-word', state.config.highlightActiveWord);
    });

    applyStopMarkerVisibility();
    syncScriptViewportSpacing();
    updateFloatingWindowVisibility();
}

function updateMicButtonVisual(button: HTMLElement, icon: HTMLElement, isListening: boolean): void {
    const pathEl = icon.querySelector('path');
    const isVoice = state.config.scrollingMode === 'voice';

    if (isListening) {
        button.classList.remove('bg-neutral-800', 'hover:bg-neutral-700');
        button.classList.add('bg-red-600', 'hover:bg-red-700', 'animate-pulse');
    } else {
        button.classList.add('bg-neutral-800', 'hover:bg-neutral-700');
        button.classList.remove('bg-red-600', 'hover:bg-red-700', 'animate-pulse');
    }

    if (!pathEl) return;

    if (isListening) {
        if (isVoice) {
            pathEl.setAttribute('d', 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z');
        } else {
            pathEl.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
        }
    } else if (isVoice) {
        pathEl.setAttribute('d', 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z');
    } else {
        pathEl.setAttribute('d', 'M8 5v14l11-7z');
    }
}

export function updateMicUI(isListening: boolean): void {
    const isVoice = state.config.scrollingMode === 'voice';
    
    updateMicButtonVisual(els.micButton, els.micIcon, isListening);
    updateMicButtonVisual(els.floatingMicButton, els.floatingMicIcon, isListening);

    els.micIcon.classList.add('text-white');
    els.floatingMicIcon.classList.add('text-white');

    if (isListening) {
        els.statusIndicator.textContent = isVoice ? 'Listening...' : 'Scrolling...';
        els.statusIndicator.classList.remove('text-neutral-500');
        els.statusIndicator.classList.add('text-red-500');
    } else {
        els.statusIndicator.textContent = isVoice ? 'Tap mic to start' : 'Tap play to start';
        els.statusIndicator.classList.add('text-neutral-500');
        els.statusIndicator.classList.remove('text-red-500');
    }
}

export function renderHistoryList(history: HistoryItem[], onLoad: (text: string, googleDocUrl?: string | null) => void): void {
    els.historyList.innerHTML = '';

    if (history.length === 0) {
        els.historyList.innerHTML = `
            <div class="text-center py-8 border border-dashed border-neutral-800 rounded-lg text-neutral-600 text-sm">
                No previous scripts found
            </div>
        `;
        els.clearHistoryBtn.classList.add('hidden');
        return;
    }

    els.clearHistoryBtn.classList.remove('hidden');

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = "bg-neutral-800 p-3 rounded border border-neutral-700 hover:border-blue-500 cursor-pointer transition group flex justify-between items-center shadow-sm min-w-[85%] md:min-w-0 snap-center";
        div.onclick = () => {
            els.inputScript.value = item.text;
            onLoad(item.text, item.googleDocUrl || null);
        };
        div.innerHTML = `
            <div class="flex flex-col text-left overflow-hidden mr-2">
                <span class="text-gray-300 text-sm font-medium truncate font-mono">${item.preview}</span>
                <div class="flex items-center gap-2">
                    <span class="text-gray-500 text-xs">${item.date}</span>
                    ${item.tag ? `<span class="text-[9px] font-bold bg-[#FFBB00]/10 text-[#FFBB00] px-1.5 py-0.5 rounded-full uppercase tracking-wider">${item.tag}</span>` : ''}
                    ${item.googleDocUrl ? `<span class="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Google Doc</span>` : ''}
                </div>
            </div>
            <div class="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </div>
        `;
        els.historyList.appendChild(div);
    });
}
