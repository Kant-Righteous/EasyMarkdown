!macro NSIS_HOOK_POSTINSTALL
  StrCpy $0 "en"

  ${If} $LANGUAGE == ${LANG_SIMPCHINESE}
    StrCpy $0 "zh-CN"
  ${ElseIf} $LANGUAGE == ${LANG_FRENCH}
    StrCpy $0 "fr"
  ${EndIf}

  WriteRegStr HKCU "Software\EasyMarkdown" "InstallerLanguage" "$0"
!macroend
