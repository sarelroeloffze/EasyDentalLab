; Custom NSIS script to handle running processes during update/install

!macro customInit
  ; Kill any running EasyDentalLab processes before installation
  nsExec::ExecToStack 'taskkill /F /IM EasyDentalLab.exe'
  Pop $0
  Pop $1

  ; Wait 2 seconds for processes to fully terminate
  Sleep 2000
!macroend

!macro customUnInit
  ; Kill any running EasyDentalLab processes before uninstallation
  nsExec::ExecToStack 'taskkill /F /IM EasyDentalLab.exe'
  Pop $0
  Pop $1

  ; Wait 2 seconds for processes to fully terminate
  Sleep 2000
!macroend
