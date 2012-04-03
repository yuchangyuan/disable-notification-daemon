
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const DBus = imports.dbus;

let text, button;

const DBusInterface = {
    name: 'org.freedesktop.DBus', //interface name
    methods: [
        {    //method name and signature
            name: 'ReleaseName',
            inSignature: 's',
            outSignature: 'u'
        },
        {
            name: 'RequestName',
            inSignature: 'su',
            outSignature: 'u'
        }
    ]
};

let DBusProxy = DBus.makeProxyClass(DBusInterface);
let dbusProxy = new DBusProxy(DBus.session, 'org.freedesktop.DBus', '/');

function _hideMessage() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showMessage(message) {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', 
                              text: message });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                      Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideMessage });
}

var enabled = true;

function _enableNotificationDaemon(enable) {
    try {
        if (enable) {
            DBus.session.exportObject('/org/freedesktop/Notifications',
                                      Main.notificationDaemon);
            dbusProxy.RequestNameRemote("org.freedesktop.Notifications", 4);
            enabled = true;
        }
        else {
            DBus.session.unexportObject(Main.notificationDaemon);
            dbusProxy.ReleaseNameRemote("org.freedesktop.Notifications");
            enabled = false;
        }
    }
    catch(e) {
    }

    enabled = enable;

    _showMessage(enable ? "Enable Notification Daemon" :
                 "Disable Notification Daemon");
}

function _toggleNotificationDaemon() {
    _enableNotificationDaemon(!enabled);
}

function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'system-run',
                             icon_type: St.IconType.SYMBOLIC,
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', _toggleNotificationDaemon);
}

function enable() {
    Main.panel._rightBox.insert_actor(button, 0);
    _enableNotificationDaemon(false);
}

function disable() {
    Main.panel._rightBox.remove_actor(button);
    _enableNotificationDaemon(true);
}

