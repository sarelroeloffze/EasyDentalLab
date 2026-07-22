; Custom NSIS script to handle running processes during update/install
; Uses aggressive termination with multiple retries and longer delays

!macro customInit
  ; Kill EasyDentalLab processes - try multiple times to ensure they're dead
  nsExec::ExecToStack 'taskkill /F /IM EasyDentalLab.exe /T'
  Pop $0
  Pop $1
  Sleep 1000

  ; Second attempt in case first didn't catch everything
  nsExec::ExecToStack 'taskkill /F /IM EasyDentalLab.exe /T'
  Pop $0
  Pop $1
  Sleep 1000

  ; Also kill any electron.exe processes (in case app is still shutting down)
  nsExec::ExecToStack 'taskkill /F /IM electron.exe /T'
  Pop $0
  Pop $1

  ; Wait 5 full seconds for Windows to release ALL file handles
  Sleep 5000
!macroend

!macro customUnInit
  ; Same aggressive termination for uninstall
  nsExec::ExecToStack 'taskkill /F /IM EasyDentalLab.exe /T'
  Pop $0
  Pop $1
  Sleep 1000

  nsExec::ExecToStack 'taskkill /F /IM EasyDentalLab.exe /T'
  Pop $0
  Pop $1
  Sleep 1000

  nsExec::ExecToStack 'taskkill /F /IM electron.exe /T'
  Pop $0
  Pop $1

  Sleep 5000
!macroend
