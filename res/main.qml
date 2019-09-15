import QtQuick 2.0
import org.kde.plasma.core 2.0 as PlasmaCore;
import org.kde.plasma.components 2.0 as Plasma;
import org.kde.kwin 2.0;
import org.kde.taskmanager 0.1 as TaskManager
import "../code/script.js" as K

Item {
    id: scriptRoot

    TaskManager.ActivityInfo {
        id: activityInfo
    }

    Component.onCompleted: {
        console.log("KROHNKITE: starting the script");
        (new K.KWinDriver()).main();
    }
}