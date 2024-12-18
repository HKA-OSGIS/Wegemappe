GITHUB SETUP

Install Git in your system

$ sudo apt install git-all

Setting SSH for seamless push/pull

Generate key with your GitHub user email

ssh-keygen -t ed25519 -C "mail@mailatgithubcom"

When you're prompted to "Enter a file in which to save the key", you can press Enter to accept the default file location. Then passphrase, you can just press enter two more times to skip it. Now your ssh key has been generated.

Add key to agent.

$ eval "$(ssh-agent -s)"

This will return > Agent pid xxxxx. Then add the key to the agent using the next code. If you did everything with default values it should be the same as typed below:

ssh-add ~/.ssh/id_ed25519

This lets your Git use the ssh key.

Copy your key contents and paste them on your GitHub account.

In GitHub, go to Settings>SSH and GPG keys>New SSH key. Give it a name. Where it says “Key” you must paste the return text of the following terminal command:

$ cat ~/.ssh/id_ed25519.pub

Now you have added the SSH key to your GitHub account.

Set the user name and email for GitHub, to sign your commits. This MUST be done. You can choose any name. For the email add your GitHub email.

git config --global user.name "Full Name"
git config --global user.email "email@address.com"

Add the project to the Desktop using SSH transfer protocol.
$ cd Desktop
$ git clone git@github.com:HKA-OSGIS/Wegemappe

Now you have a project folder with Git. Any changes made will be tracked by Git.
