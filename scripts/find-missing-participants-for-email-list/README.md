# find-missing-participants-for-email-list.py

1. Export the participants list from the offentlig-paas.no admin to a file:
   https://offentlig-paas.no/admin/events/{event}/attendees
2. Copy the email list from the Outlook meeting.
3. Run the script:

   ```
   py find-missing-participants-for-email-list.py "{path to offentlig-paas.no CSV påmeldinger}" "{email list from To-field in Outlook}" --ignore "{path to email list ignores}"
   ```

4. Check output. Do you need ignores? Create a textfile where each line is an email to ignore and run the script again.
5. Copy the email list with the deviations.
6. Forward the meeting to the email list with the deviations.
