export interface Elements {
    setupScreen: HTMLElement;
    prompterContainer: HTMLElement;
    scrollWrapper: HTMLElement;
    inputScript: HTMLTextAreaElement;
    scriptContent: HTMLElement;
    scrollContainer: HTMLElement;
    topSpacer: HTMLElement;
    mainControlsDock: HTMLElement;
    settingsPanel: HTMLElement;
    activeLinePositionInput: HTMLInputElement;
    activeLinePositionVal: HTMLElement;
    fontSizeInput: HTMLInputElement;
    fontSizeVal: HTMLElement;
    lineHeightInput: HTMLInputElement;
    lineHeightVal: HTMLElement;
    paragraphSpacingInput: HTMLInputElement;
    paragraphSpacingVal: HTMLElement;
    marginInput: HTMLInputElement;
    marginVal: HTMLElement;
    dockOpacityInput: HTMLInputElement;
    dockOpacityVal: HTMLElement;
    lookaheadWordsInput: HTMLInputElement;
    lookaheadWordsVal: HTMLElement;
    textColorInput: HTMLInputElement;
    bgColorInput: HTMLInputElement;
    appBody: HTMLElement;
    micButton: HTMLElement;
    micIcon: HTMLElement;
    statusIndicator: HTMLElement;
    mirrorToggle: HTMLInputElement;
    mirrorModeLabel: HTMLElement;
    hMirrorRow: HTMLElement;
    hMirrorToggle: HTMLInputElement;
    browserWarning: HTMLElement;
    dismissWarningBtn: HTMLElement;
    ipadPwaWarning: HTMLElement;
    dismissIpadWarningBtn: HTMLElement;
    langDetectionWarning: HTMLElement;
    dismissLangWarningBtn: HTMLElement;
    androidVideoWarning: HTMLElement;
    dismissAndroidVideoWarningBtn: HTMLElement;
    historyList: HTMLElement;
    historySection: HTMLElement;
    stopSignToggle: HTMLInputElement;
    alignBtns: {
        left: HTMLElement;
        center: HTMLElement;
        right: HTMLElement;
    };
    dirBtns: {
        ltr: HTMLElement;
        rtl: HTMLElement;
    };
    // Buttons
    loadScriptBtn: HTMLElement;
    clearHistoryBtn: HTMLElement;
    resetAppBtn: HTMLElement;
    restartScriptBtn: HTMLElement;
    toggleSettingsBtn: HTMLElement;
    closeSettingsBtn: HTMLElement;
    themeDarkBtn: HTMLElement;
    themeLightBtn: HTMLElement;
    // Quick Actions
    copyScriptBtn: HTMLElement;
    clearScriptBtn: HTMLElement;
    pasteScriptBtn: HTMLElement;
    // Language Selection
    languageSelectContainer: HTMLElement;
    languageSelectSettingsContainer: HTMLElement;
    // Toggles
    preserveFormattingToggle: HTMLInputElement;
    voiceCommandToggle: HTMLInputElement;
    screenRotationToggle: HTMLInputElement;
    fullscreenToggle: HTMLInputElement;
    smoothAnimationsToggle: HTMLInputElement;
    highlightActiveWordToggle: HTMLInputElement;
    floatingWindowToggle: HTMLInputElement;
    // Font Family
    fontFamilyBtns: {
        mono: HTMLElement;
        sans: HTMLElement;
        serif: HTMLElement;
        comicSans: HTMLElement;
        openDyslexic: HTMLElement;
    };
    scrollingModeSelect: HTMLSelectElement;
    scrollingModeDescription: HTMLElement;
    scrollSpeedContainer: HTMLElement;
    scrollSpeedInput: HTMLInputElement;
    scrollSpeedVal: HTMLElement;
    soundSensitivityContainer: HTMLElement;
    soundSensitivityInput: HTMLInputElement;
    soundSensitivityVal: HTMLElement;
    // Video Recording
    videoModeBtn: HTMLElement;
    videoPreview: HTMLVideoElement;
    videoContainer: HTMLElement;
    videoLayoutToggleBtn: HTMLElement;
    videoFlipCameraBtn: HTMLElement;
    videoRecordBtn: HTMLElement;
    videoStopBtn: HTMLElement;
    videoControls: HTMLElement;
    videoRecordingIndicator: HTMLElement;
    // Google Doc Integration
    importGoogleDocBtn: HTMLElement;
    googleDocModal: HTMLElement;
    googleDocUrlInput: HTMLInputElement;
    confirmGoogleDocImportBtn: HTMLElement;
    closeGoogleDocModalBtn: HTMLElement;
    pasteGoogleDocUrlBtn: HTMLElement;
    refreshGoogleDocBtn: HTMLElement;
    refreshGoogleDocContainer: HTMLElement;
    copyGoogleDocUrlBtn: HTMLElement;
    videoDeviceSelect: HTMLSelectElement;
    audioDeviceSelect: HTMLSelectElement;
    devicesSelectionContainer: HTMLElement;
    floatingPrompterWindow: HTMLElement;
    floatingWindowHeader: HTMLElement;
    floatingWindowCloseBtn: HTMLElement;
    floatingScrollContainer: HTMLElement;
    floatingTopSpacer: HTMLElement;
    floatingScriptContent: HTMLElement;
    floatingControlsDock: HTMLElement;
    floatingResetAppBtn: HTMLElement;
    floatingMicButton: HTMLElement;
    floatingMicIcon: HTMLElement;
    floatingRestartScriptBtn: HTMLElement;
    floatingVideoModeBtn: HTMLElement;
    floatingToggleSettingsBtn: HTMLElement;
}

export let els: Elements;

export function initElements(): void {
    els = {
        setupScreen: document.getElementById('setupScreen')!,
        prompterContainer: document.getElementById('prompterContainer')!,
        scrollWrapper: document.getElementById('scrollWrapper')!,
        inputScript: document.getElementById('inputScript') as HTMLTextAreaElement,
        scriptContent: document.getElementById('scriptContent')!,
        scrollContainer: document.getElementById('scrollContainer')!,
        topSpacer: document.getElementById('topSpacer')!,
        mainControlsDock: document.getElementById('mainControlsDock')!,
        settingsPanel: document.getElementById('settingsPanel')!,
        activeLinePositionInput: document.getElementById('activeLinePositionInput') as HTMLInputElement,
        activeLinePositionVal: document.getElementById('activeLinePositionVal')!,
        fontSizeInput: document.getElementById('fontSizeInput') as HTMLInputElement,
        fontSizeVal: document.getElementById('fontSizeVal')!,
        lineHeightInput: document.getElementById('lineHeightInput') as HTMLInputElement,
        lineHeightVal: document.getElementById('lineHeightVal')!,
        paragraphSpacingInput: document.getElementById('paragraphSpacingInput') as HTMLInputElement,
        paragraphSpacingVal: document.getElementById('paragraphSpacingVal')!,
        marginInput: document.getElementById('marginInput') as HTMLInputElement,
        marginVal: document.getElementById('marginVal')!,
        dockOpacityInput: document.getElementById('dockOpacityInput') as HTMLInputElement,
        dockOpacityVal: document.getElementById('dockOpacityVal')!,
        lookaheadWordsInput: document.getElementById('lookaheadWordsInput') as HTMLInputElement,
        lookaheadWordsVal: document.getElementById('lookaheadWordsVal')!,
        textColorInput: document.getElementById('textColorInput') as HTMLInputElement,
        bgColorInput: document.getElementById('bgColorInput') as HTMLInputElement,
        appBody: document.getElementById('appBody')!,
        micButton: document.getElementById('micButton')!,
        micIcon: document.getElementById('micIcon')!,
        statusIndicator: document.getElementById('statusIndicator')!,
        mirrorToggle: document.getElementById('mirrorToggle') as HTMLInputElement,
        mirrorModeLabel: document.getElementById('mirrorModeLabel')!,
        hMirrorRow: document.getElementById('hMirrorRow')!,
        hMirrorToggle: document.getElementById('hMirrorToggle') as HTMLInputElement,
        browserWarning: document.getElementById('browserWarning')!,
        dismissWarningBtn: document.getElementById('dismissWarningBtn')!,
        ipadPwaWarning: document.getElementById('ipadPwaWarning')!,
        dismissIpadWarningBtn: document.getElementById('dismissIpadWarningBtn')!,
        langDetectionWarning: document.getElementById('langDetectionWarning')!,
        dismissLangWarningBtn: document.getElementById('dismissLangWarningBtn')!,
        androidVideoWarning: document.getElementById('androidVideoWarning')!,
        dismissAndroidVideoWarningBtn: document.getElementById('dismissAndroidVideoWarningBtn')!,
        historyList: document.getElementById('historyList')!,
        historySection: document.getElementById('historySection')!,
        stopSignToggle: document.getElementById('stopSignToggle') as HTMLInputElement,
        alignBtns: {
            left: document.getElementById('alignLeftBtn')!,
            center: document.getElementById('alignCenterBtn')!,
            right: document.getElementById('alignRightBtn')!
        },
        dirBtns: {
            ltr: document.getElementById('dirLtrBtn')!,
            rtl: document.getElementById('dirRtlBtn')!
        },
        // Buttons
        loadScriptBtn: document.getElementById('loadScriptBtn')!,
        clearHistoryBtn: document.getElementById('clearHistoryBtn')!,
        resetAppBtn: document.getElementById('resetAppBtn')!,
        restartScriptBtn: document.getElementById('restartScriptBtn')!,
        toggleSettingsBtn: document.getElementById('toggleSettingsBtn')!,
        closeSettingsBtn: document.getElementById('closeSettingsBtn')!,
        themeDarkBtn: document.getElementById('themeDarkBtn')!,
        themeLightBtn: document.getElementById('themeLightBtn')!,
        // Quick Actions
        copyScriptBtn: document.getElementById('copyScriptBtn')!,
        clearScriptBtn: document.getElementById('clearScriptBtn')!,
        pasteScriptBtn: document.getElementById('pasteScriptBtn')!,
        // Language Selection
        languageSelectContainer: document.getElementById('languageSelectContainer')!,
        languageSelectSettingsContainer: document.getElementById('languageSelectSettingsContainer')!,
        // Toggles
        preserveFormattingToggle: document.getElementById('preserveFormattingToggle') as HTMLInputElement,
        voiceCommandToggle: document.getElementById('voiceCommandToggle') as HTMLInputElement,
        screenRotationToggle: document.getElementById('screenRotationToggle') as HTMLInputElement,
        fullscreenToggle: document.getElementById('fullscreenToggle') as HTMLInputElement,
        smoothAnimationsToggle: document.getElementById('smoothAnimationsToggle') as HTMLInputElement,
        highlightActiveWordToggle: document.getElementById('highlightActiveWordToggle') as HTMLInputElement,
        floatingWindowToggle: document.getElementById('floatingWindowToggle') as HTMLInputElement,
        // Font Family
        fontFamilyBtns: {
            mono: document.getElementById('fontFamilyMonoBtn')!,
            sans: document.getElementById('fontFamilySansBtn')!,
            serif: document.getElementById('fontFamilySerifBtn')!,
            comicSans: document.getElementById('fontFamilyComicSansBtn')!,
            openDyslexic: document.getElementById('fontFamilyOpenDyslexicBtn')!
        },
        scrollingModeSelect: document.getElementById('scrollingModeSelect') as HTMLSelectElement,
        scrollingModeDescription: document.getElementById('scrollingModeDescription')!,
        scrollSpeedContainer: document.getElementById('scrollSpeedContainer')!,
        scrollSpeedInput: document.getElementById('scrollSpeedInput') as HTMLInputElement,
        scrollSpeedVal: document.getElementById('scrollSpeedVal')!,
        soundSensitivityContainer: document.getElementById('soundSensitivityContainer')!,
        soundSensitivityInput: document.getElementById('soundSensitivityInput') as HTMLInputElement,
        soundSensitivityVal: document.getElementById('soundSensitivityVal')!,
        // Video Recording
        videoModeBtn: document.getElementById('videoModeBtn')!,
        videoPreview: document.getElementById('videoPreview') as HTMLVideoElement,
        videoContainer: document.getElementById('videoContainer')!,
        videoLayoutToggleBtn: document.getElementById('videoLayoutToggleBtn')!,
        videoFlipCameraBtn: document.getElementById('videoFlipCameraBtn')!,
        videoRecordBtn: document.getElementById('videoRecordBtn')!,
        videoStopBtn: document.getElementById('videoStopBtn')!,
        videoControls: document.getElementById('videoControls')!,
        videoRecordingIndicator: document.getElementById('videoRecordingIndicator')!,
        // Google Doc Integration
        importGoogleDocBtn: document.getElementById('importGoogleDocBtn')!,
        googleDocModal: document.getElementById('googleDocModal')!,
        googleDocUrlInput: document.getElementById('googleDocUrlInput') as HTMLInputElement,
        confirmGoogleDocImportBtn: document.getElementById('confirmGoogleDocImportBtn')!,
        closeGoogleDocModalBtn: document.getElementById('closeGoogleDocModalBtn')!,
        pasteGoogleDocUrlBtn: document.getElementById('pasteGoogleDocUrlBtn')!,
        refreshGoogleDocBtn: document.getElementById('refreshGoogleDocBtn')!,
        refreshGoogleDocContainer: document.getElementById('refreshGoogleDocContainer')!,
        copyGoogleDocUrlBtn: document.getElementById('copyGoogleDocUrlBtn')!,
        videoDeviceSelect: document.getElementById('videoDeviceSelect') as HTMLSelectElement,
        audioDeviceSelect: document.getElementById('audioDeviceSelect') as HTMLSelectElement,
        devicesSelectionContainer: document.getElementById('devicesSelectionContainer')!,
        floatingPrompterWindow: document.getElementById('floatingPrompterWindow')!,
        floatingWindowHeader: document.getElementById('floatingWindowHeader')!,
        floatingWindowCloseBtn: document.getElementById('floatingWindowCloseBtn')!,
        floatingScrollContainer: document.getElementById('floatingScrollContainer')!,
        floatingTopSpacer: document.getElementById('floatingTopSpacer')!,
        floatingScriptContent: document.getElementById('floatingScriptContent')!,
        floatingControlsDock: document.getElementById('floatingControlsDock')!,
        floatingResetAppBtn: document.getElementById('floatingResetAppBtn')!,
        floatingMicButton: document.getElementById('floatingMicButton')!,
        floatingMicIcon: document.getElementById('floatingMicIcon')!,
        floatingRestartScriptBtn: document.getElementById('floatingRestartScriptBtn')!,
        floatingVideoModeBtn: document.getElementById('floatingVideoModeBtn')!,
        floatingToggleSettingsBtn: document.getElementById('floatingToggleSettingsBtn')!
    };
}
