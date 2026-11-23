# NeuroNav 🧠

**An interactive neuroscience study companion for curious minds.**

NeuroNav brings together an anatomical 3D brain, bite-sized concept cards, a quiz and a calm workspace. This starter prototype was developed with ChatGPT for review and further development.

## Explore my projects

| Project | About | Open |
| :--- | :--- | :--- |
| **NeuroNav** 🧠 | A neuroscience study companion with a 3D brain explorer. | [Explore this repository](#explore-the-experience) |
| **SpotMe** 🏋️ | A gym companion concept; the team won Best Idea at QHack 2026. | [Try the interactive prototype](https://claude.ai/artifact/18M5uzGjmrLY3wRFdNevhC) · [Read about SpotMe](projects/SpotMe.md) |
| **Study Plan** 📚 | Study-planning project. | Link to be added |
| **Decision Making** 💡 | Decision-making project. | Link to be added |

[See the full project showcase →](PROJECTS.md)

## Explore the experience

- **3D brain explorer:** rotate and zoom an anatomical model, choose a region, fade other structures and learn what each helps us do. Use the on-screen controls or arrow keys as an alternative to dragging. Region groupings are approximate.
- **Brain bank:** search and filter 12 introductory concepts, reveal short explanations and mark cards as studied.
- **Study space:** use a 10-, 15- or 25-minute focus timer and a small autosaving notebook.
- **Quick quiz:** try five questions and get an explanation after each answer.
- **Make it yours:** switch between dark and light themes. Notes, card progress and theme preferences are stored on your device.

## Try it

Download the project and open `index.html` in a modern browser. If your browser restricts local files, run a small local server instead:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. The app works without a network connection after the files are downloaded; source links require internet. The 3D model requires a browser with WebGL. If 3D is unavailable, the study tools and descriptions remain usable.

The notebook, study progress and theme use browser `localStorage` and stay on that browser/device. The timer is session-only. There is no account, database or server-side collection of your notes. Clearing browser data can erase locally saved information.

## Project structure

```text
NeuroNav/
├── index.html              # Page structure
├── styles.css              # Responsive, theme-aware design
├── brain.js                # Anatomical 3D viewer and controls
├── app.js                  # Study cards, notes, timer and quiz
├── assets/
│   ├── anatomy-*.js        # BodyParts3D anatomical meshes
│   ├── ANATOMY-ATTRIBUTION.md
│   ├── three.min.js        # Three.js r160, MIT licensed
│   └── THREE-LICENSE.txt
├── PROJECTS.md             # Project showcase
├── projects/               # Additional project write-ups
└── README.md
```

## Sources and scope

The introductory content is based on:

- [NINDS: Brain Basics](https://www.ninds.nih.gov/health-information/public-education/brain-basics)
- [NINDS: Know Your Brain](https://www.ninds.nih.gov/sites/default/files/2025-05/know-your-brain-brian-basics.pdf)
- [MedlinePlus: Nerve conduction](https://medlineplus.gov/ency/anatomyvideos/000089.htm)
- [MedlinePlus: White matter of the brain](https://medlineplus.gov/ency/article/002344.htm)

This is an introductory educational prototype, not a clinical tool. Colours and grouped lobe boundaries are provided for learning and should not be treated as a precise anatomical atlas.

## Next ideas

- Add topics, diagrams and citations for the subjects you are studying.
- Add quiz questions and topic-specific practice.
- Add an export option for notes and cards.
- Share the design choices and what you learned while developing the project.

The viewer was inspired by [BrainFacts.org's 3D Brain](https://www.brainfacts.org/3d-brain). The anatomical meshes are derived from **BodyParts3D, © DBCLS**, under [CC BY-SA 2.1 JP](https://creativecommons.org/licenses/by-sa/2.1/jp/). See [model attribution](assets/ANATOMY-ATTRIBUTION.md) for provenance and modifications. The viewer uses [Three.js](https://github.com/mrdoob/three.js), licensed under MIT; its licence is included in `assets/THREE-LICENSE.txt`.
