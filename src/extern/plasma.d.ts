declare namespace Plasma {
  namespace TaskManager {
    /* reference: https://github.com/KDE/plasma-workspace/blob/master/libtaskmanager/activityinfo.h */
    interface ActivityInfo {
      /* read-only */
      readonly currentActivity: string;
      readonly numberOfRunningActivities: number;

      /* methods */
      runningActivities(): string[];
      activityName(id: string): string;

      /* signals */
      currentActivityChanged: QSignal;
      numberOfRunningActivitiesChanged: QSignal;
      namesOfRunningActivitiesChanged: QSignal;
    }
  }
}
