//====================================================================================================================ATTACH MULTIPLE FILES IN EDIT FORM
    function OkAttach(e) {
        ULSopi:;
        var fileID = FileuploadString + String(FileUploadIndex);
        var fileInput = GetAttachElement(fileID);
        for (var i = 0; i < fileInput.files.length; i++) {
            var filename = TrimWhiteSpaces(fileInput.files[i].name);
            if (!Boolean(filename)) {
                alert(Strings.STS.L_FileNameRequired_TXT);
                fileInput.focus();
            } else {
                var filNameOnly = filename.substring(filename.lastIndexOf('\\') + 1);
                if (IndexOfIllegalCharInUrlLeafName(filNameOnly) != -1) {
                    alert(Strings.STS.L_IllegalFileNameError);
                    return;
                }
                var oRow = (document.getElementById("idAttachmentsTable")).insertRow(-1);
                var RowID = 'attachRow' + String(FileUploadIndex);
                oRow.id = RowID;
                var oCellFileName = oRow.insertCell(-1);
                oCellFileName.className = "ms-vb";
                oCellFileName.innerHTML = "<span dir=\"ltr\">" + filename + "</span>&nbsp;&nbsp;&nbsp;&nbsp;";
                var oCellControl = oRow.insertCell(-1);
                oCellControl.className = "ms-propertysheet";
                var item = (document.getElementsByName("RectGifUrl"))[0];
                oCellControl.innerHTML = "<span class=\"ms-delAttachments\"><IMG SRC='" + item.value + "'>&nbsp;<a href='javascript:RemoveLocal(\"" + RowID + "\",\"" + fileID + "\")'>" + Strings.STS.L_Delete_Text + "</a></span>";
            }
        }
        fileInput.style.display = "none";
        ++FileUploadIndex;
        ++FileUploadLocalFileCount;
        var oAttachments = document.getElementById("attachmentsOnClient");
        var inputNode = document.createElement("input");
        inputNode.tabIndex = 1;
        inputNode.type = "File";
        inputNode.className = "ms-longfileinput";
        inputNode.title = Strings.STS.L_FileUploadToolTip_text;
        inputNode.name = FileuploadString + String(FileUploadIndex);
        inputNode.id = FileuploadString + String(FileUploadIndex);
        inputNode.size = 56;
        oAttachments.appendChild(inputNode);
        $(inputNode).attr('multiple', 'multiple').on('change', function(e) {
            //console.log(e);
            OkAttach(e);
        });
        var aForm = fileInput.form;
        aForm.encoding = 'multipart/form-data';
        (document.getElementById("idAttachmentsRow")).style.display = "";
        ShowPart1();
    }
