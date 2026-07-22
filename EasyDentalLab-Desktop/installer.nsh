; Custom NSIS script - kill processes BEFORE NSIS checks for old installation
; This runs at the VERY START of the installer

!macro preInit
  ; This runs BEFORE NSIS checks for existing installation
  ; Kill all processes immediately so old uninstaller can succeed

  nsExec::Exec 'taskkill /F /IM EasyDentalLab.exe /T'
  Sleep 1000
  nsExec::Exec 'taskkill /F /IM EasyDentalLab.exe /T'
  Sleep 1000
  nsExec::Exec 'taskkill /F /IM electron.exe /T'
  Sleep 3000
!macroend

!macro customInit
  ; Additional kill at customInit (runs after preInit)
  nsExec::Exec 'taskkill /F /IM EasyDentalLab.exe /T'
  Sleep 1000
  nsExec::Exec 'taskkill /F /IM electron.exe /T'
  Sleep 3000
!macroend

!macro customUnInit
  ; Kill before uninstall
  nsExec::Exec 'taskkill /F /IM EasyDentalLab.exe /T'
  Sleep 1000
  nsExec::Exec 'taskkill /F /IM electron.exe /T'
  Sleep 3000
!macroend
