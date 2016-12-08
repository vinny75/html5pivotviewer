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
                console.log('JSON loaded');

                if (data.FacetCategories == undefined || data.Items == undefined) {
                    //Make sure throbber is removed else everyone thinks the app is still running
                    $('.pv-loading').remove();

                    //Display message so the user knows something is wrong
                    PivotViewer.Utils.ModalDialog('Error parsing JSON Collection<br><br>Pivot Viewer cannot continue until this problem is resolved<br>');
                    throw "Error parsing JSON Collection";
                }

                if (data.CollectionName != undefined) {
                    collection.CollectionName = data.CollectionName;
                }

                if (data.BrandImage != undefined) {
                    collection.BrandImage = data.BrandImage;
                }

                //FacetCategories
                for (var i = 0; i < data.FacetCategories.length; i++) {
					var facetElement = data.FacetCategories[i];
					
                    var facetCategory = new PivotViewer.Models.FacetCategory(
                        facetElement.Name,
                        facetElement.Format,
                        facetElement.Type,
                        facetElement.IsFilterVisible != undefined ? (facetElement.IsFilterVisible.toLowerCase() == "true" ? true : false) : true,
                        facetElement.IsMetadataVisible != undefined ? (facetElement.IsMetadataVisible.toLowerCase() == "true" ? true : false) : true,
                        facetElement.IsWordWheelVisible != undefined ? (facetElement.IsWordWheelVisible.toLowerCase() == "true" ? true : false) : true
                    );

                    if (facetElement.SortOrder != undefined) {
                        var customSort = new PivotViewer.Models.FacetCategorySort(facetElement.SortOrder.Name);
                        for (var j = 0; j < facetElement.SortValues.Value.length; j++) {
                            customSort.Values.push(facetElement.SortValues.Value[j]);
                        }
                        facetCategory.CustomSort = customSort;
                    }

                    collection.FacetCategories.push(facetCategory);
                }

                if (data.ImgBase != undefined) {
                    collection.ImageBase = data.ImgBase;
                }

                // Item 
                if (data.Items.length == 0) {
                    //Make sure throbber is removed else everyone thinks the app is still running
                    $('.pv-loading').remove();

                    //Display a message so the user knows something is wrong
                    PivotViewer.Utils.ModalDialog('There are no items in the JSON Collection<br><br>');
                } else {
                    for (var i = 0; i < data.Items.length; i++) {
						var facetItem = data.Items[i];
					
                        var item = new PivotViewer.Models.Item(
                            facetItem.Img.replace("#", ""),
                            facetItem.Id,
                            facetItem.Href,
                            facetItem.Name
                        );

                        item.Description = PivotViewer.Utils.HtmlSpecialChars(facetItem.Description);

						var facets = facetItem.Facets.Facet;
                        for (var j = 0; j < facets.length; j++) {
							var facet = facets[j];
							var facetCategory = collection.GetFacetCategoryByName(facet.Name);
							if (facetCategory != null) {
								facetCategory.items.push(item.Id);
								var values = [];
								
								switch (facetCategory.Type) {
									case "Number":
										for (var k = 0; k < facet.Value.length; k++) {
											var value = new PivotViewer.Models.FacetValue(parseFloat(facet.Value[k]));
											values.push(value);
										}
										break;
									case "Link":
										for (var k = 0; k < facet.Value.length; k++) {
											var value = new PivotViewer.Models.FacetValue(facet.Value[k].Name);
											value.Href = facet.Value[k].Href;
											values.push(value);
										}								
										break;
									case "String":
									case "LongString":
									case "DateTime":
										for (var k = 0; k < facet.Value.length; k++) {
											var value = new PivotViewer.Models.FacetValue(facet.Value[k]);
											values.push(value);
										}
										break;
									default:
										console.log("Undefined facet category type: " + facet.Name + " for item: " + item.Name);
								}
								
								var f = new PivotViewer.Models.Facet(
									facet.Name,
									values
								);
								item.Facets.push(f);
							} else {
								console.log("Undefined facet category: " + facet.Name + " for item: " + item.Name);
							}
                        }

                        // Handle related links here 
                        if (facetItem.Extension != undefined &&
                            facetItem.Extension.Related != undefined) {
                            item.Links = facetItem.Extension.Related.Link;
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

                if (collection.Items.length > 0) {
                    $.publish("/PivotViewer/Models/Collection/Loaded", null);
                }
            })
            .fail(function(jqXHR, status, error) {
                //Make sure throbber is removed else everyone thinks the app is still running
                $('.pv-loading').remove();

                PivotViewer.Utils.AjaxErrorModalDialog(jqXHR, status, error, this.url, "Error loading JSON Collection");
            });
    }
});