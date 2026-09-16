# Screenshot capture guide

Use real screenshots from your own machine — do not use mock terminal output. Save the images in this folder before you push the project to GitHub.

## Recommended images

| Filename | What to capture |
| --- | --- |
| `cli-build-success.png` | PowerShell after `npm.cmd run build` completes successfully. |
| `cli-app-running.png` | PowerShell after `npm.cmd run start:full`, showing the server is listening on port 5000. |
| `landing-page.png` | The ParkPilot landing page at `http://localhost:5000`. |
| `dashboard.png` | The logged-in dashboard using any demo account. |

## Quick capture steps

1. Run the command you want to document.
2. Press `Win` + `Shift` + `S` and select the terminal or browser area.
3. Save the image with the matching filename above in this folder.
4. Commit the image files with the rest of the project.

Avoid capturing passwords, MongoDB connection strings, `.env` values, or any personal information.
