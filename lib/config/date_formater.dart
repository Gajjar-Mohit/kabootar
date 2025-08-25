class DateFormater {
   static formatCurrentTime(DateTime now) {
    final hour = now.hour > 12 ? now.hour - 12 : now.hour;
    final period = now.hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour == 0 ? 12 : hour;
    return '$displayHour:${now.minute.toString().padLeft(2, '0')} $period';
  }
}
