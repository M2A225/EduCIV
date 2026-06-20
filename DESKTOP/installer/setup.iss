[Setup]
AppId={{E7D34B6E-5F6A-4B2C-9A1E-3C8D7F2E5A9B}
AppName=EduCIV
AppVersion=1.0.0
AppPublisher=ANICE
DefaultDirName={autopf}\EduCIV
DefaultGroupName=EduCIV
OutputDir=..\publish
OutputBaseFilename=educiv-setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
DisableProgramGroupPage=yes
DisableReadyPage=no
LicenseFile=..\..\LICENSE

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\publish\educiv.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\EduCIV"; Filename: "{app}\educiv.exe"
Name: "{group}\{cm:UninstallProgram,EduCIV}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\EduCIV"; Filename: "{app}\educiv.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\educiv.exe"; Description: "{cm:LaunchProgram,EduCIV}"; Flags: nowait postinstall skipifsilent

[Code]
var
  NeedsMemo: Boolean;

function InitializeSetup(): Boolean;
begin
  NeedsMemo := True;
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if (CurStep = ssPostInstall) and NeedsMemo then
  begin
    if MsgBox('EduCIV est maintenant installé. Voulez-vous le lancer maintenant ?',
       mbConfirmation, MB_YESNO) = IDYES then
    begin
      Exec(ExpandConstant('{app}\educiv.exe'), '', '', SW_SHOW, ewNoWait, ResultCode);
    end;
  end;
end;
