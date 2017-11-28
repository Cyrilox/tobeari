import os, signal, subprocess

# Paramètres
dossier = "release\\" # Dossier à parcourir
dossierDev = "WebContent" # Dossier à parcourir

prioritaires = ["Main.js", "Boot.js", "Ability.js", "GraphicInterface.js", "Entity.js"]
fichierExclusionCopie = "copy_exclusions.txt"
dossierExternes = "release\\lib"

fichierUnique = "release\\all.js"
fichierHtml = "release\\index.html"

# Déplacement dans le répertoire courant
dossierCourant = os.getcwd() + "\\"
os.chdir(dossierCourant)

# Chemins complet
cheminDossier = dossierCourant + dossier
cheminDossierDev = dossierCourant + dossierDev
cheminFichierExclusion = dossierCourant + fichierExclusionCopie
cheminDossierExternes = dossierCourant + dossierExternes
cheminFichierUnique = dossierCourant + fichierUnique
cheminFichierHtml = dossierCourant + fichierHtml

# Poubelle
trash = open(os.devnull, 'w')



# *** Copie du répertoire de développement vers le dossier release ***

# Message
print("\nCréation du dossier release en cours...\n")

# Suppression du dossier
os.system("rmdir /s /q \"" + cheminDossier + "\"")

# Création du dossier
os.system("mkdir \"" + cheminDossier + "\"")

# Copie
os.system("xcopy /s /e /q /exclude:" + fichierExclusionCopie + " \"" + cheminDossierDev + "\" \"" + cheminDossier + "\"")

# Message
print("\nCréation terminée.")



# *** Fusion de tous les fichiers Javascript en 1 gros fichier ***

# Message
print("\nFusion en cours...")

# Gros fichier
filesTexts = {}

# Parcours de tous les fichiers du dossier, sauf l'externe
def doFolder(path):
	empty = True
	for element in os.listdir(path):
		fullpath = path + element
		if os.path.isdir(fullpath):# Dossier
			if fullpath != cheminDossierExternes:
				# Récursivité sur tous les fichiers
				folderEmpty = doFolder(fullpath + "\\");
				# Suppression du dossier
				if folderEmpty:
					os.system("rmdir \"" + fullpath + "\"")
			
		elif element.endswith('.js'):# Fichier
			doFile(fullpath, element)
		else:
			empty = False
	
	return empty

def doFile(file, name):
	global filesTexts, trash
	
	# Lecture
	with open(file, "r", encoding="utf8") as fichier:
		filesTexts[name] = fichier.read()
	
	# Suppression du fichier, avec erreur si non possible
	os.remove(file)

# Commencement
doFolder(cheminDossier)

# Contenu
listeFichiers = ""
nombreFichiers = 0;

# Gros fichier
bigFileText = ""

for i, nom in enumerate(prioritaires):#Prioritaires
	bigFileText += filesTexts[nom] + "\n\n"
	nombreFichiers = nombreFichiers + 1
	listeFichiers += "\n" + str(nombreFichiers) + "| " + nom
	
for nom, contenu in filesTexts.items():#Autres
	if nom not in prioritaires:
		bigFileText += contenu
		nombreFichiers = nombreFichiers + 1
		listeFichiers += "\n" + str(nombreFichiers) + "| " + nom

# Informations
infos = "\nNombre de fichiers : " + str(nombreFichiers)
infos += "\nListe :" + listeFichiers
print(infos)

# Ecriture du fichier unique
with open(cheminFichierUnique, "w", encoding="utf8") as fichier:
	fichier.write(bigFileText)

# Message
print("\nFusion terminée.")



# *** Compilation du fichier unique ***

# Message
print("\nCompilation en cours...")

# Fichiers externes
externs = ""
for element in os.listdir(cheminDossierExternes):
	if element.endswith('.js'):# Fichier
		externs += " --externs \"" + cheminDossierExternes + "\\" + element + "\""

# Compilation
command = "java -jar closure-compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js \"" + cheminFichierUnique + "\" --js_output_file \"" + cheminFichierUnique + "\" " + externs
subprocess.call(command, stdout=trash, stderr=subprocess.STDOUT)

# Message
print("\nCompilation terminée.")



# *** Modification du fichier ***

# Message
print("\nModification du fichier en cours...")

# Suppresion du code non désiré
with open(cheminFichierHtml, "r", encoding="utf8") as fichier:
	contenu = fichier.read()

iDebut = contenu.find("<!-- flag_delete_start -->")
flagFin = "<!-- flag_delete_end -->"
iFin = contenu.find(flagFin) + len(flagFin) + 1
delete = contenu[iDebut:iFin]
contenu = contenu.replace(delete, "")

contenu = contenu.replace("<!-- flag_uncomment_debut", "")
contenu = contenu.replace("flag_uncomment_fin-->", "")

with open(cheminFichierHtml, "w", encoding="utf8") as fichier:
	fichier.write(contenu)

# Message
print("\nModification terminée.")



# *** FIN ***

# Poubelle
trash.close();

# Message
print("\nTâches terminées.\n")
