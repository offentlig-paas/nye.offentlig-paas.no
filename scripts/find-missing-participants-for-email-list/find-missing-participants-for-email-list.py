"""Find participants in the offentlig-paas.no CSV who are missing from an Outlook email list.

Prints a summary with counts, then the missing emails as a "; "-separated list
that can be pasted straight into the "To" field in Outlook.
With --details it also prints a table of everyone in both lists and a domain overview.
"""

import argparse
import csv
import os
import re
import subprocess
import sys
from collections import Counter

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

EPILOG = """\
modes:
  default    Counts + the missing emails, ready to paste into Outlook.
  --details  Also a table of all participants from both lists (name, email,
             in CSV / in list) and a domain overview, before the default output.

examples:
  python find-missing-participants-for-email-list.py deltakere.csv epostliste.txt
  python find-missing-participants-for-email-list.py deltakere.csv epostliste.txt --copy
  python find-missing-participants-for-email-list.py deltakere.csv epostliste.txt --details
  python find-missing-participants-for-email-list.py deltakere.csv epostliste.txt --ignore ignorer.txt
  python find-missing-participants-for-email-list.py deltakere.csv "Ola Jensen <ola.jensen@x.no>; 'kari@y.no'"

input files:
  CSV        Export from offentlig-paas.no. Emails are read from the "E-post" column.
  EMAILLIST  The recipient list copied from Outlook, either as a text file or
             passed directly as a string (wrap it in quotes), e.g.
             Ola Jensen <ola.jensen@x.no>; 'ola.jensen@x.no'; ...
             Every email address in the file is picked up, regardless of format.
  --ignore   Optional text file with one email per line. These emails are left out
             of the Outlook "To" output and listed as ignored. Blank lines are skipped.

Emails are compared case-insensitively.
"""


def read_csv(path):
    """Return (row count, list of (email, name))."""
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    people = [
        (row["E-post"].strip().lower(), row.get("Navn", "").strip())
        for row in rows
        if row.get("E-post", "").strip()
    ]
    return len(rows), people


def read_list(arg):
    """Return (entry count, list of (email, name)). Name is "" when the entry has none."""
    if os.path.isfile(arg):
        with open(arg, encoding="utf-8-sig", errors="replace") as f:
            text = f.read()
    elif "@" in arg:
        text = arg
    else:
        sys.exit(f"error: '{arg}' is neither an existing file nor an email list")

    entries = [e.strip() for e in text.split(";") if e.strip()]
    people = []
    for entry in entries:
        name = entry.rsplit("<", 1)[0].strip().strip("'") if "<" in entry else ""
        for email in EMAIL_RE.findall(entry):
            people.append((email.lower(), name))
    return len(entries), people


def read_ignores(path):
    """Return the emails in the ignore file (one per line), lowercased, in file order."""
    with open(path, encoding="utf-8-sig") as f:
        lines = [line.strip().lower() for line in f]
    return list(dict.fromkeys(line for line in lines if line))


def domain(email):
    return email.split("@", 1)[1]


def yes(flag):
    return "x" if flag else ""


def print_table(headers, rows):
    widths = [max(len(str(v)) for v in col) for col in zip(headers, *rows)]
    line = "  ".join("{:<%d}" % w for w in widths)
    print(line.format(*headers))
    print(line.format(*("-" * w for w in widths)))
    for row in rows:
        print(line.format(*row))


def print_details(csv_names, list_names, ignores):
    all_emails = sorted(set(csv_names) | set(list_names), key=lambda e: (domain(e), e))

    print(f"=== All participants ({len(all_emails)} unique emails across both lists) ===")
    rows = []
    for i, email in enumerate(all_emails, 1):
        name = csv_names.get(email) or list_names.get(email) or ""
        rows.append((i, name, email, yes(email in csv_names), yes(email in list_names), yes(email in ignores)))
    print_table(("#", "Name", "Email", "In CSV", "In list", "Ignored"), rows)
    print()

    both = sum(1 for e in all_emails if e in csv_names and e in list_names)
    print(f"In both lists:  {both}")
    print(f"Only in CSV:    {sum(1 for e in csv_names if e not in list_names)}")
    print(f"Only in list:   {sum(1 for e in list_names if e not in csv_names)}")
    print()

    domains = Counter(domain(e) for e in all_emails)
    print(f"=== Domains ({len(domains)}) ===")
    rows = [
        (d, total,
         sum(1 for e in csv_names if domain(e) == d),
         sum(1 for e in list_names if domain(e) == d))
        for d, total in sorted(domains.items(), key=lambda kv: (-kv[1], kv[0]))
    ]
    print_table(("Domain", "Total", "In CSV", "In list"), rows)
    print()


def main():
    parser = argparse.ArgumentParser(
        description="Find emails in the offentlig-paas.no CSV that are NOT in the Outlook participant list, "
        "and print them as a list ready to paste into Outlook's \"To\" field.",
        epilog=EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("csv", help="CSV export from offentlig-paas.no")
    parser.add_argument("emaillist", help="email list copied from Outlook: a text file, or the list itself as a quoted string")
    parser.add_argument("-d", "--details", action="store_true", help="also show a participant table and domain overview")
    parser.add_argument("-i", "--ignore", metavar="FILE", help="file with emails (one per line) to leave out of the Outlook output")
    parser.add_argument("-c", "--copy", action="store_true", help="also copy the result to the clipboard")

    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)
    args = parser.parse_args()
    sys.stdout.reconfigure(errors="replace")  # don't crash on unusual characters in names

    csv_rows, csv_people = read_csv(args.csv)
    list_entries, list_people = read_list(args.emaillist)

    # email -> name, deduplicated (dicts keep CSV order). The list keeps the first non-empty name.
    csv_names, list_names = {}, {}
    for email, name in csv_people:
        csv_names.setdefault(email, name)
    for email, name in list_people:
        if not list_names.get(email):
            list_names[email] = name

    ignores = read_ignores(args.ignore) if args.ignore else []
    missing = [e for e in csv_names if e not in list_names]
    matched = len(csv_names) - len(missing)
    ignored = [e for e in missing if e in ignores]
    output = [e for e in missing if e not in ignores]

    if args.details:
        print_details(csv_names, list_names, ignores)

    print("=== Counts ===")
    print(f"CSV (offentlig-paas.no):  {csv_rows} rows, {len(csv_people)} emails, {len(csv_names)} unique")
    print(f"Outlook email list:       {list_entries} entries, {len(list_people)} emails, {len(list_names)} unique")
    print(f"CSV emails in list:       {matched}")
    print(f"CSV emails NOT in list:   {len(missing)}")
    print(f"Check: {matched} + {len(missing)} = {matched + len(missing)} (should equal {len(csv_names)} unique CSV emails)")
    if args.ignore:
        print(f"Ignored (from {args.ignore}): {len(ignored)} of the {len(missing)} missing are skipped")
        print(f"Check: {len(missing)} - {len(ignored)} = {len(output)} emails in the Outlook output")
    print()

    if args.ignore:
        print(f"=== Ignore file: {len(ignores)} emails - these are SKIPPED in the Outlook output ===")
        for email in ignores:
            note = "SKIPPED (missing from list)" if email in ignored else "no effect (not among the missing)"
            print(f"  {email:<40} {note}")
        print()

    result = "; ".join(output)
    excluding = f", {len(ignored)} ignored excluded" if args.ignore else ""
    print(f"=== Missing from email list ({len(output)}{excluding}) - paste into Outlook \"To\" ===")
    print(result if output else "(none)")

    if args.copy and output:
        subprocess.run("clip", input=result, text=True, check=True, shell=True)
        print("\n(copied to clipboard)")


if __name__ == "__main__":
    main()
