# Reminder
>[!note]
>**Always use** the `sync` command after running an rsync command.
# Commands

### Use case

Use this command when copying files from one hard drive to another.

>[!note]
>With trailing slash, this **copies only the contents** of /source/ into /destination/.
>
>Without trailing slash, this **copies the directory itself** (`source`) and its contents **into** `/destination/`.

```
rsync -avhP /path/to/source /path/to/destination
```

| Option | Description                                                                                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -a     | **Archive mode**: Recursively copy files and directories, and preserve symbolic links, file permissions, timestamps, group, owner, and device files.                               |
| -v     | **Verbose**: Show detailed information about what `rsync` is doing.                                                                                                                |
| -h     | **Human-readable**: Format file sizes in a human-readable way (e.g., 1K, 234M, 2G).                                                                                                |
| -P     | Combines:  <br>• `--progress`: Shows progress of individual file transfers  <br>• `--partial`: Keeps partially transferred files if the transfer is interrupted (allows resuming). |

### Use case

Use this when you uploaded files via Syncthing. This will copy the files from staging to correct directories.

```
rsync --remove-source-files -avhP /path/to/source /path/to/destination
```

| Option                | Description                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| --remove-source-files | **Deletes source files after** successful copy to the destination. Does **not** remove directories, only individual files. |

>[!note]
>Be very careful when running this command. Use `--dry-run` to perform a trial run first that doesn’t make any changes (and produces mostly the same output as a real run).
>
>It is most commonly used in combination with the `-v`, `--verbose` and/or `-i`, `--itemize-changes` options to see what an rsync command is going to do before one actually runs it.



