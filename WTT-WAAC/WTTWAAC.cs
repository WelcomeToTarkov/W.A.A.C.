using System.Reflection;
using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Models.Spt.Mod;
using WTTServerCommonLib.Models;
using Range = SemanticVersioning.Range;

namespace WTTWAAC;

public record ModMetadata : AbstractModMetadata
{
    public override string ModGuid { get; init; } = "com.wtt.waac";
    public override string Name { get; init; } = "WTT-WAAC";
    public override string Author { get; init; } = "GrooveypenguinX";
    public override List<string>? Contributors { get; init; } = null;
    public override SemanticVersioning.Version Version { get; init; } = new(typeof(ModMetadata).Assembly.GetName().Version?.ToString(3));
    public override Range SptVersion { get; init; } = new("~4.0.1");
    public override List<string>? Incompatibilities { get; init; }
    public override Dictionary<string, Range>? ModDependencies { get; init; } = new()
    {
        { "com.wtt.commonlib", new Range("~2.0.0") }
    };
    public override string? Url { get; init; }
    public override bool? IsBundleMod { get; init; } = true;
    public override string License { get; init; } = "MIT";
}

[Injectable(TypePriority = OnLoadOrder.PostDBModLoader + 2)]
public class WAAC(
    WTTServerCommonLib.WTTServerCommonLib wttCommon) : IOnLoad
{
    public async Task OnLoad()
    {
        Assembly assembly = Assembly.GetExecutingAssembly();
        await wttCommon.CustomClothingService.CreateCustomClothing(assembly);
        await wttCommon.CustomItemServiceExtended.CreateCustomItems(assembly);
        await wttCommon.CustomVoiceService.CreateCustomVoices(assembly);
        await wttCommon.CustomHeadService.CreateCustomHeads(assembly);
    }
}
