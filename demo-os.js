#!/usr/bin/env node

const { Lipgloss, initLip, huh } = require('./dist/index.js');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class TUIWindow {
  constructor(lip, id, title, x, y, width, height, focused = false) {
    this.lip = lip;
    this.id = id;
    this.title = title;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.focused = focused;
    this.minimized = false;
    this.maximized = false;
  }

  async render(content = '') {
    const borderColor = this.focused ? '#00FF00' : '#666666';
    const titleColor = this.focused ? '#FFFFFF' : '#AAAAAA';
    const bgColor = this.focused ? '#001100' : '#111111';
    
    if (this.minimized) {
      return `[${this.title}]`;
    }

    // Window frame
    await this.lip.createStyle({
      id: `window-${this.id}`,
      border: { 
        type: 'rounded', 
        foreground: borderColor,
        sides: [true, true, true, true]
      },
      canvasColor: { background: bgColor },
      width: this.width,
      height: this.height
    });

    // Title bar
    await this.lip.createStyle({
      id: `title-${this.id}`,
      canvasColor: { color: titleColor, background: borderColor },
      bold: true,
      alignH: 'center',
      width: this.width - 2,
      padding: [0, 1]
    });

    const titleBar = await this.lip.apply({ 
      value: `${this.title} ${this.maximized ? '⬜' : '🗖'} ${this.minimized ? '🗕' : '➖'} ❌`, 
      id: `title-${this.id}` 
    });

    // Content area
    await this.lip.createStyle({
      id: `content-${this.id}`,
      padding: [1, 2],
      width: this.width - 4,
      height: this.height - 4
    });

    const windowContent = await this.lip.apply({ 
      value: content, 
      id: `content-${this.id}` 
    });

    const windowElements = [titleBar, windowContent];
    const window = await this.lip.join({
      direction: 'vertical',
      position: 'left',
      elements: windowElements
    });

    return await this.lip.apply({ value: window, id: `window-${this.id}` });
  }
}

class TUIDesktop {
  constructor(lip) {
    this.lip = lip;
    this.windows = [];
    this.taskbar = [];
    this.focusedWindow = 0;
    this.notifications = [];
    this.time = new Date().toLocaleTimeString();
  }

  addWindow(title, content, width = 40, height = 15) {
    const id = this.windows.length;
    const x = 5 + (id * 3);
    const y = 2 + (id * 2);
    const window = new TUIWindow(this.lip, id, title, x, y, width, height, id === this.focusedWindow);
    this.windows.push(window);
    this.taskbar.push({ id, title, minimized: false });
    return window;
  }

  async renderDesktop() {
    // Desktop background pattern
    await this.lip.createStyle({
      id: 'desktop-bg',
      canvasColor: { background: '#000022' },
      width: 120,
      height: 40
    });

    const pattern = '░'.repeat(120 * 3);
    const desktop = await this.lip.apply({ value: pattern, id: 'desktop-bg' });
    
    return desktop;
  }

  async renderTaskbar() {
    await this.lip.createStyle({
      id: 'taskbar',
      canvasColor: { background: '#333333', color: '#FFFFFF' },
      border: { type: 'block', foreground: '#555555', sides: [true, false, false, false] },
      width: 120,
      height: 3,
      padding: [0, 2]
    });

    const taskItems = this.taskbar.map(task => 
      `[${task.minimized ? '-' : '■'}] ${task.title}`
    ).join('  ');
    
    const systemInfo = `CPU: 45% | RAM: 8.2GB | ${this.time}`;
    const taskbarContent = `${taskItems}${' '.repeat(60)}${systemInfo}`;

    return await this.lip.apply({ value: taskbarContent, id: 'taskbar' });
  }

  async renderStartMenu() {
    await this.lip.createStyle({
      id: 'start-menu',
      border: { type: 'rounded', foreground: '#0078D4', sides: [true, true, true, true] },
      canvasColor: { background: '#1E1E1E', color: '#FFFFFF' },
      width: 35,
      height: 20,
      padding: [1, 2]
    });

    const menuItems = [
      '🏠 Home',
      '📁 File Manager', 
      '⚙️ Settings',
      '🔧 Control Panel',
      '💻 Terminal',
      '🌐 Web Browser',
      '📝 Text Editor',
      '🎨 Graphics Editor',
      '🎵 Music Player',
      '📊 Task Manager',
      '🔒 Security Center',
      '📦 Package Manager',
      '🗂️ Archive Manager',
      '📷 Screenshot Tool',
      '🔄 System Update',
      '⚡ Power Options'
    ].join('\n');

    return await this.lip.apply({ value: menuItems, id: 'start-menu' });
  }

  async renderNotifications() {
    if (this.notifications.length === 0) return '';

    await this.lip.createStyle({
      id: 'notifications',
      border: { type: 'rounded', foreground: '#FFA500', sides: [true, true, true, true] },
      canvasColor: { background: '#2D2D2D', color: '#FFFFFF' },
      width: 50,
      height: this.notifications.length * 3 + 2,
      padding: [1, 2]
    });

    const notifText = this.notifications.map(notif => 
      `🔔 ${notif.title}\n   ${notif.message}`
    ).join('\n\n');

    return await this.lip.apply({ value: notifText, id: 'notifications' });
  }

  async renderContextMenu(x, y) {
    await this.lip.createStyle({
      id: 'context-menu',
      border: { type: 'block', foreground: '#CCCCCC', sides: [true, true, true, true] },
      canvasColor: { background: '#F0F0F0', color: '#000000' },
      width: 20,
      height: 10,
      padding: [1, 1]
    });

    const menuItems = [
      '📋 Paste',
      '🔄 Refresh', 
      '🎨 Personalize',
      '📊 Properties',
      '⚙️ Settings',
      '❌ Close Menu'
    ].join('\n');

    return await this.lip.apply({ value: menuItems, id: 'context-menu' });
  }
}

async function createFileManager(lip) {
  await lip.createStyle({
    id: 'file-manager',
    padding: [1],
    width: 60,
    height: 20
  });

  // File tree
  const fileTree = `
📁 /
├── 📁 home/
│   ├── 📁 user/
│   │   ├── 📄 document.txt
│   │   ├── 🖼️ photo.jpg
│   │   └── 📁 projects/
│   │       ├── 📁 tui-app/
│   │       └── 📄 README.md
├── 📁 etc/
│   ├── 📄 config.conf
│   └── 📄 hosts
├── 📁 usr/
│   ├── 📁 bin/
│   └── 📁 lib/
└── 📁 var/
    ├── 📁 log/
    └── 📁 tmp/`;

  return await lip.apply({ value: fileTree, id: 'file-manager' });
}

async function createSystemMonitor(lip) {
  await lip.createStyle({
    id: 'system-monitor',
    padding: [1],
    width: 50,
    height: 15
  });

  const sysInfo = `
SYSTEM MONITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CPU Usage: ████████░░ 78%
Memory:    ██████░░░░ 65% (5.2GB/8GB)
Disk I/O:  ███░░░░░░░ 34%
Network:   ██████████ 95%

Top Processes:
├─ chrome      18% CPU  1.2GB RAM
├─ node        12% CPU  456MB RAM  
├─ code         8% CPU  892MB RAM
├─ firefox      6% CPU  678MB RAM
└─ spotify      4% CPU  234MB RAM

Uptime: 2d 14h 23m
Load: 2.34, 1.89, 1.56`;

  return await lip.apply({ value: sysInfo, id: 'system-monitor' });
}

async function createTerminal(lip) {
  await lip.createStyle({
    id: 'terminal',
    canvasColor: { background: '#000000', color: '#00FF00' },
    padding: [1],
    width: 70,
    height: 18
  });

  const terminalContent = `
user@tui-os:~$ ps aux | head
USER       PID %CPU %MEM    VSZ   RSS TTY    STAT START   TIME COMMAND
root         1  0.0  0.1  19356  1544 ?      Ss   Dec01   0:02 /sbin/init
root         2  0.0  0.0      0     0 ?      S    Dec01   0:00 [kthreadd]
user       485  2.1  4.5 123456 45678 ?      Sl   10:23   0:45 /usr/bin/node
user       501  1.8  2.1  98765 21456 pts/0  S+   10:24   0:32 npm run demo

user@tui-os:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   35G   13G  74% /
/dev/sda2       100G   67G   28G  71% /home
tmpfs           4.0G  2.1G  1.9G  53% /tmp

user@tui-os:~$ █`;

  return await lip.apply({ value: terminalContent, id: 'terminal' });
}

async function createMediaPlayer(lip) {
  await lip.createStyle({
    id: 'media-player',
    padding: [1],
    width: 60,
    height: 16
  });

  const player = `
🎵 AKAOIO MEDIA PLAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

♪ Now Playing: Coding Beats - Lo-Fi Hip Hop Mix

🎨 Album: Developer's Soundtrack Vol.3
👤 Artist: CodeBeats Studio
⏱️ Duration: 3:42 / 45:23

Progress: ████████░░░░░░░░░░░░░░░░░░░░░░ 32%

🔊 Volume: ████████░░ 80%

[◀◀] [▶️] [▶▶] [🔀] [🔁] [❤️]

📻 Up Next:
├─ Deep Focus Piano  
├─ Ambient Coding    
└─ Synthwave Nights  `;

  return await lip.apply({ value: player, id: 'media-player' });
}

async function main() {
  console.clear();
  console.log('🖥️ Initializing TUI-OS Desktop Environment...\n');
  
  const initialized = await initLip();
  if (!initialized) {
    console.error('❌ Failed to initialize WASM');
    process.exit(1);
  }

  const lip = new Lipgloss();
  const desktop = new TUIDesktop(lip);

  // Add system notifications
  desktop.notifications = [
    { title: 'System Update', message: '3 updates available' },
    { title: 'Low Battery', message: '15% remaining' }
  ];

  console.log('✅ TUI-OS Desktop Environment Ready!\n');
  console.log('=' .repeat(120));

  // Create various application windows
  const fileManagerWin = desktop.addWindow('📁 File Manager', await createFileManager(lip), 65, 22);
  const terminalWin = desktop.addWindow('💻 Terminal', await createTerminal(lip), 75, 20);
  const sysMonWin = desktop.addWindow('📊 System Monitor', await createSystemMonitor(lip), 55, 17);
  const mediaWin = desktop.addWindow('🎵 Media Player', await createMediaPlayer(lip), 65, 18);

  // Simulate different window states
  desktop.windows[1].focused = false;  // Terminal unfocused
  desktop.windows[2].minimized = false; // System monitor normal
  desktop.windows[3].maximized = false; // Media player normal

  // Set focus to file manager
  desktop.windows[0].focused = true;
  desktop.focusedWindow = 0;

  console.log('\n🏠 DESKTOP ENVIRONMENT');
  console.log(await desktop.renderDesktop());

  console.log('\n📊 TASKBAR');
  console.log(await desktop.renderTaskbar());

  console.log('\n🗃️ START MENU');
  console.log(await desktop.renderStartMenu());

  console.log('\n🔔 NOTIFICATIONS');
  console.log(await desktop.renderNotifications());

  console.log('\n📋 CONTEXT MENU (Right-click simulation)');
  console.log(await desktop.renderContextMenu(50, 20));

  console.log('\n🖼️ ACTIVE WINDOWS');
  
  // Render all windows in a tiled layout
  const windows = [];
  for (let i = 0; i < desktop.windows.length; i++) {
    if (!desktop.windows[i].minimized) {
      const windowContent = await desktop.windows[i].render(
        i === 0 ? await createFileManager(lip) :
        i === 1 ? await createTerminal(lip) :
        i === 2 ? await createSystemMonitor(lip) :
        await createMediaPlayer(lip)
      );
      windows.push(windowContent);
    }
  }

  // Create a 2x2 grid layout
  const topRow = await lip.join({
    direction: 'horizontal', 
    position: 'top',
    elements: windows.slice(0, 2)
  });

  const bottomRow = await lip.join({
    direction: 'horizontal',
    position: 'top', 
    elements: windows.slice(2, 4)
  });

  const windowGrid = await lip.join({
    direction: 'vertical',
    position: 'left',
    elements: [topRow, bottomRow]
  });

  console.log(windowGrid);

  // Simulated interactions
  console.log('\n' + '='.repeat(120));
  console.log('\n🖱️ SIMULATED INTERACTIONS:');
  console.log('• Mouse hover over window → Border color changes');
  console.log('• Click drag window → Position updates');  
  console.log('• Double-click titlebar → Maximize/restore');
  console.log('• Right-click desktop → Context menu appears');
  console.log('• Drag window edge → Resize cursor');
  console.log('• Alt+Tab → Window switching');
  console.log('• Win+D → Show desktop');

  console.log('\n⚙️ WINDOW MANAGEMENT:');
  console.log(`• Active Windows: ${desktop.windows.length}`);
  console.log(`• Focused Window: ${desktop.windows[desktop.focusedWindow].title}`);
  console.log(`• Minimized: ${desktop.windows.filter(w => w.minimized).length}`);
  console.log(`• Memory Usage: ${(desktop.windows.length * 50).toFixed(1)} MB`);

  console.log('\n🔧 SYSTEM CAPABILITIES:');
  console.log('• Multi-window management ✅');
  console.log('• Window focus/blur states ✅');
  console.log('• Taskbar with running apps ✅'); 
  console.log('• Start menu navigation ✅');
  console.log('• Context menus ✅');
  console.log('• Notification system ✅');
  console.log('• File manager UI ✅');
  console.log('• Terminal emulation ✅');
  console.log('• System monitoring ✅');
  console.log('• Media player interface ✅');
  console.log('• Drag & drop simulation 🎯');
  console.log('• Window resize handles 🎯');
  console.log('• Mouse cursor tracking 🎯');

  console.log('\n' + '='.repeat(120));
  console.log('\n✨ TUI-OS Desktop Environment Demo Complete!');
  console.log('🚀 This demonstrates the full potential of @akaoio/tui');
  console.log('💡 All UI components are rendered using terminal-based styling');
  console.log('🎨 Colors, borders, layouts - everything is pure TUI!');
  console.log('\n🎉 Welcome to the future of Terminal User Interfaces!\n');
}

main().catch(error => {
  console.error('❌ TUI-OS Demo failed:', error);
  process.exit(1);
});