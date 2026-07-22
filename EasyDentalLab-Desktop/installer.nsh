; Custom NSIS script - force overwrite installation, skip uninstall entirely
; Kill processes and manually handle installation

!macro preInit
  ; Kill all processes
  nsExec::Exec 'taskkill /F /IM EasyDentalLab.exe /T'
  Sleep 1000
  nsExec::Exec 'taskkill /F /IM electron.exe /T'
  Sleep 2000

  ; Force delete old installation directory to ensure clean install
  ; This bypasses the uninstaller entirely
  SetOutPath $TEMP
  nsExec::Exec 'cmd /c rmdir /S /Q "$LOCALAPPDATA\Programs\easydentallab"'
  Sleep 2000
!macroend

!macro customInit
  ; Nothing needed - preInit handles everything
!macroend

!macro customInstall
  ; Launch the app after installation completes
  Exec '"$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
!macroend

!macro customUnInit
  ; Standard uninstall - kill processes first
  nsExec::Exec 'taskkill /F /IM EasyDentalLab.exe /T'
  Sleep 1000
  nsExec::Exec 'taskkill /F /IM electron.exe /T'
  Sleep 2000
!macroend
