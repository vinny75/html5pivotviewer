//
//  HTML5 PivotViewer
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

//JSON loader
PivotViewer.Models.Loaders.JSONLoader = PivotViewer.Models.Loaders.ICollectionLoader.subClass({
    init: function(JSONUri, proxy) {
        this.JSONUriNoProxy = JSONUri;
        if (proxy) {
            this.JSONUri = proxy + JSONUri;
        } else {
            this.JSONUri = JSONUri;
        }
    },
    LoadCollection: function(collection) {
        var collection = collection;
        this._super(collection);

        collection.CollectionBaseNoProxy = this.JSONUriNoProxy;
        collection.CollectionBase = this.JSONUri;

        $.getJSON(this.JSONUri)
            .done(function(data) {
                Debug.Log('JSON loaded');

                if (data.FacetCategories == undefined || data.Items == undefined) {
                    //Make sure throbber is removed else everyone thinks the app is still running
                    $('.pv-loading').remove();

                    //Display message so the user knows something is wrong
                    var msg = '';
                    msg = msg + 'Error parsing CXML Collection<br>';
                    msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
                    PivotViewer.Utils.ModalDialog(msg);
                    throw "Error parsing CXML Collection";
                }

                if (data.CollectionName != undefined) {
                    collection.CollectionName = data.CollectionName;
                }

                if (data.BrandImage != undefined) {
                    collection.BrandImage = data.BrandImage;
                }

                //FacetCategories
                for (var i = 0; i < data.FacetCategories.FacetCategory.length; i++) {

                    var facetCategory = new PivotViewer.Models.FacetCategory(
                        data.FacetCategories.FacetCategory[i].Name,
                        data.FacetCategories.FacetCategory[i].Format,
                        data.FacetCategories.FacetCategory[i].Type,
                        data.FacetCategories.FacetCategory[i].IsFilterVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsFilterVisible.toLowerCase() == "true" ? true : false) : true,
                        data.FacetCategories.FacetCategory[i].IsMetadataVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsMetadataVisible.toLowerCase() == "true" ? true : false) : true,
                        data.FacetCategories.FacetCategory[i].IsWordWheelVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsWordWheelVisible.toLowerCase() == "true" ? true : false) : true
                    );

                    if (data.FacetCategories.FacetCategory[i].SortOrder != undefined) {
                        var customSort = new PivotViewer.Models.FacetCategorySort(data.FacetCategories.FacetCategory[i].SortOrder.Name);
                        for (var j = 0; j < data.FacetCategories.FacetCategory[i].SortValues.Value.length; j++) {
                            customSort.Values.push(data.FacetCategories.FacetCategory[i].SortValues.Value[j]);
                        }
                        facetCategory.CustomSort = customSort;
                    }

                    collection.FacetCategories.push(facetCategory);
                }

                if (data.Items.ImgBase != undefined) {
                    collection.ImageBase = data.Items.ImgBase;
                }

                // Item 
                if (data.Items.Item.length == 0) {

                    //Make sure throbber is removed else everyone thinks the app is still running
                    $('.pv-loading').remove();

                    //Display a message so the user knows something is wrong
                    var msg = '';
                    msg = msg + 'There are no items in the CXML Collection<br><br>';
                    PivotViewer.Utils.ModalDialog(msg);
                } else {
                    for (var i = 0; i < data.Items.Item.length; i++) {
                        var item = new PivotViewer.Models.Item(
                            data.Items.Item[i].Img.replace("#", ""),
                            data.Items.Item[i].Id,
                            data.Items.Item[i].Href,
                            data.Items.Item[i].Name
                        );

                        item.Description = PivotViewer.Utils.HtmlSpecialChars(data.Items.Item[i].Description);

                        for (var j = 0; j < data.Items.Item[i].Facets.Facet.length; j++) {
                            var values = [];
                            if (data.Items.Item[i].Facets.Facet[j].Number != undefined) {
                                if (data.Items.Item[i].Facets.Facet[j].Number.length > 0) {
                                    for (var k = 0; k < data.Items.Item[i].Facets.Facet[j].Number.length; k++) {
                                        var value = new PivotViewer.Models.FacetValue(parseFloat(data.Items.Item[i].Facets.Facet[j].Number[k].Value));
                                        values.push(value);
                                    }
                                } else {
                                    var value = new PivotViewer.Models.FacetValue(parseFloat(data.Items.Item[i].Facets.Facet[j].Number.Value));
                                    values.push(value);
                                }
                            } else if (data.Items.Item[i].Facets.Facet[j].Link != undefined) {
                                for (var k = 0; k < data.Items.Item[i].Facets.Facet[j].Link.length; k++) {
                                    var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].Link[k].Name);
                                    value.Href = data.Items.Item[i].Facets.Facet[j].Link[k].Href;
                                    values.push(value);
                                }
                            } else if (data.Items.Item[i].Facets.Facet[j].String != undefined) {
                                if (data.Items.Item[i].Facets.Facet[j].String.length > 0) {
                                    for (var k = 0; k < data.Items.Item[i].Facets.Facet[j].String.length; k++) {
                                        var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].String[k].Value);
                                        values.push(value);
                                    }
                                } else {
                                    var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].String.Value);
                                    values.push(value);
                                }
                            } else if (data.Items.Item[i].Facets.Facet[j].LongString != undefined) {
                                if (data.Items.Item[i].Facets.Facet[j].LongString.length > 0) {
                                    for (var k = 0; k < data.Items.Item[i].Facets.Facet[j].LongString.length; k++) {
                                        var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].LongString[k].Value);
                                        values.push(value);
                                    }
                                } else {
                                    var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].LongString.Value);
                                    values.push(value);
                                }
                            } else if (data.Items.Item[i].Facets.Facet[j].DateTime != undefined) {
                                if (data.Items.Item[i].Facets.Facet[j].DateTime.length > 0) {
                                    for (var k = 0; k < data.Items.Item[i].Facets.Facet[j].DateTime.length; k++) {
                                        var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].DateTime[k].Value);
                                        values.push(value);
                                    }
                                } else {
                                    var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].DateTime.Value);
                                    values.push(value);
                                }
                            } else { // Unexpected data type

                                //Make sure throbber is removed else everyone thinks the app is still running
                                $('.pv-loading').remove();

                                //Display a message so the user knows something is wrong
                                var msg = '';
                                msg = msg + 'Error parsing the CXML Collection:<br>Unrecognised facet value type<br>';
                                PivotViewer.Utils.ModalDialog(msg);
                            }

                            var facet = new PivotViewer.Models.Facet(
                                data.Items.Item[i].Facets.Facet[j].Name,
                                values
                            );
                            item.Facets.push(facet);
                        }

                        // Handle related links here 
                        if (data.Items.Item[i].Extension != undefined &&
                            data.Items.Item[i].Extension.Related != undefined) {
                            item.Links = data.Items.Item[i].Extension.Related.Link;
                        }

                        collection.Items.push(item);
                    }
                }

                //Extensions
                if (data.Extension != undefined) {
                    if (data.Extension.Copyright != undefined) {
                        collection.CopyrightName = data.Extension.Copyright.Name;
                        collection.CopyrightHref = data.Extension.Copyright.Href;
                    }
                }

                if (data.Items.Item.length > 0) {
                    $.publish("/PivotViewer/Models/Collection/Loaded", null);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                //Make sure throbber is removed else everyone thinks the app is still running
                $('.pv-loading').remove();

                //Display a message so the user knows something is wrong
                var msg = '';
                msg = msg + 'Error loading CXML Collection<br><br>';
                msg = msg + 'URL        : ' + this.url + '<br>';
                msg = msg + 'Status : ' + jqXHR.status + ' ' + errorThrown + '<br>';
                msg = msg + 'Details    : ' + jqXHR.responseText + '<br>';
                msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
                PivotViewer.Utils.ModalDialog(msg);
            });
    }
});