!macro NSIS_HOOK_PREINSTALL
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; Ensure uninstaller shortcut exists in the Start Menu folder
  CreateShortcut "$SMPROGRAMS\Floatio\Uninstall Floatio.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  Delete "$SMPROGRAMS\Floatio\Uninstall Floatio.lnk"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
!macroend
